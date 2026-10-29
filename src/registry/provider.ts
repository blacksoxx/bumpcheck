import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, rm, stat, cp } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';

/**
 * A PackageProvider materializes `<pkg>@<version>` into an overlay directory
 * shaped like `<overlay>/node_modules/<pkg>/...`, with the package's own
 * dependencies installed beside it so its declaration files resolve.
 *
 * Returning the overlay root (not the package dir) lets TypeScript's normal
 * node_modules walk do the rest.
 */
export interface PackageProvider {
  ensure(pkg: string, version: string): Promise<string>;
}

export interface NpmProviderOptions {
  cacheDir?: string;
  registry?: string;
  /** Override for tests or exotic setups. Defaults to `npm` on PATH. */
  npmBinary?: string;
}

function defaultCacheDir(): string {
  const xdg = process.env['XDG_CACHE_HOME'];
  const base = xdg && xdg.length > 0 ? xdg : path.join(homedir(), '.cache');
  return path.join(base, 'bumpcheck', 'npm');
}

function safeSegment(s: string): string {
  return s.replace(/[@/]/g, '_');
}

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

function run(bin: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd, stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (d: Buffer) => (stderr += d.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${bin} ${args.join(' ')} failed (${code}):\n${stderr.trim()}`));
    });
  });
}

/**
 * Installs the exact version with npm into a per-version overlay and caches it.
 * Scripts never run. Peer dependencies are installed so declaration files
 * that import them still resolve.
 */
export class NpmProvider implements PackageProvider {
  private readonly cacheDir: string;
  private readonly registry: string | undefined;
  private readonly npm: string;
  private readonly inflight = new Map<string, Promise<string>>();

  constructor(opts: NpmProviderOptions = {}) {
    this.cacheDir = opts.cacheDir ?? defaultCacheDir();
    this.registry = opts.registry ?? process.env['BUMPCHECK_REGISTRY'];
    this.npm = opts.npmBinary ?? 'npm';
  }

  ensure(pkg: string, version: string): Promise<string> {
    const key = `${pkg}@${version}`;
    let p = this.inflight.get(key);
    if (!p) {
      p = this.install(pkg, version);
      this.inflight.set(key, p);
    }
    return p;
  }

  private async install(pkg: string, version: string): Promise<string> {
    const overlay = path.join(this.cacheDir, `${safeSegment(pkg)}@${safeSegment(version)}`);
    const marker = path.join(overlay, '.bumpcheck-ok');
    if (await exists(marker)) return overlay;

    await rm(overlay, { recursive: true, force: true });
    await mkdir(overlay, { recursive: true });
    await writeJson(path.join(overlay, 'package.json'), { name: 'bumpcheck-overlay', private: true });

    const args = [
      'install',
      `${pkg}@${version}`,
      '--ignore-scripts',
      '--no-package-lock',
      '--no-audit',
      '--no-fund',
      '--no-bin-links',
      '--loglevel=error',
      '--save-exact',
    ];
    if (this.registry) args.push(`--registry=${this.registry}`);
    await run(this.npm, args, overlay);

    const pkgDir = path.join(overlay, 'node_modules', pkg);
    const manifest = JSON.parse(await readFile(path.join(pkgDir, 'package.json'), 'utf8')) as Manifest;
    if (manifest.version !== version) {
      throw new Error(`Expected ${pkg}@${version}, npm installed ${manifest.version ?? 'unknown'}`);
    }

    // Packages without their own declarations usually have a DefinitelyTyped
    // package. Install the one matching this major, best effort, so the
    // overlay resolves the way the consumer's node_modules would.
    let types: string | undefined;
    if (!(await shipsTypes(pkgDir, manifest))) {
      const typesName = definitelyTypedName(pkg);
      const major = version.split('.')[0];
      for (const spec of [`${typesName}@${major}`, typesName]) {
        try {
          await run(this.npm, [...args.slice(0, 1), spec, ...args.slice(2)], overlay);
          types = spec;
          break;
        } catch {
          // No matching @types package; the report will say so.
        }
      }
    }
    await writeJson(marker, { pkg, version, types, at: new Date().toISOString() });
    return overlay;
  }
}

interface Manifest {
  version?: string;
  types?: string;
  typings?: string;
  exports?: unknown;
}

async function shipsTypes(pkgDir: string, manifest: Manifest): Promise<boolean> {
  if (manifest.types || manifest.typings) return true;
  if (manifest.exports && JSON.stringify(manifest.exports).includes('"types"')) return true;
  const entries = await readdir(pkgDir).catch(() => [] as string[]);
  return entries.some((e) => e.endsWith('.d.ts') || e.endsWith('.d.mts') || e.endsWith('.d.cts'));
}

/** `@scope/name` becomes `@types/scope__name`, as DefinitelyTyped does. */
export function definitelyTypedName(pkg: string): string {
  if (pkg.startsWith('@')) {
    const [scope, name] = pkg.slice(1).split('/');
    return `@types/${scope}__${name}`;
  }
  return `@types/${pkg}`;
}

/**
 * Copies a local directory into an overlay. Used by tests and for air-gapped
 * runs where the package contents are already on disk.
 */
export class LocalProvider implements PackageProvider {
  private readonly inflight = new Map<string, Promise<string>>();

  constructor(
    private readonly sources: Record<string, string>,
    private readonly workDir: string,
  ) {}

  ensure(pkg: string, version: string): Promise<string> {
    const key = `${pkg}@${version}`;
    let p = this.inflight.get(key);
    if (!p) {
      p = this.materialize(pkg, key);
      this.inflight.set(key, p);
    }
    return p;
  }

  private async materialize(pkg: string, key: string): Promise<string> {
    const src = this.sources[key];
    if (!src) throw new Error(`LocalProvider has no source for ${key}`);
    const overlay = path.join(this.workDir, safeSegment(key));
    const dest = path.join(overlay, 'node_modules', pkg);
    await rm(overlay, { recursive: true, force: true });
    await mkdir(path.dirname(dest), { recursive: true });
    await cp(src, dest, { recursive: true });
    return overlay;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  const { writeFile } = await import('node:fs/promises');
  await writeFile(file, JSON.stringify(value, null, 2) + '\n');
}
