import { spawnSync } from 'node:child_process';
import path from 'node:path';

/** A direct dependency whose pinned version changed between two git refs. */
export interface DetectedBump {
  /** Directory of the package.json, relative to the repo root, '' for the root. */
  dir: string;
  pkg: string;
  from: string;
  to: string;
}

const DEP_FIELDS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'] as const;

type Manifest = Partial<Record<(typeof DEP_FIELDS)[number], Record<string, string>>>;
interface Lockfile {
  packages?: Record<string, { version?: string }>;
}

function git(repo: string, args: string[]): string | undefined {
  const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8' });
  return r.status === 0 ? r.stdout : undefined;
}

function readJson<T>(text: string | undefined): T | undefined {
  if (!text) return undefined;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
}

/** `^1.2.3`, `~1.2.3`, `1.2.3` -> `1.2.3`; ranges and tags -> undefined. */
export function exactVersion(spec: string | undefined): string | undefined {
  if (!spec) return undefined;
  const m = /^[\^~]?v?(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)$/.exec(spec.trim());
  return m ? m[1] : undefined;
}

/**
 * Finds direct dependencies whose version changed between `base` and `head`
 * in any package.json, using the lockfile beside it when present so range
 * specs like `^1.2.0` resolve to the versions actually installed.
 */
export function detectBumps(repoRoot: string, base: string, head = 'HEAD'): DetectedBump[] {
  const changed = git(repoRoot, ['diff', '--name-only', base, head, '--', '*package.json', '*package-lock.json'])
    ?.split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.includes('node_modules/'));
  if (!changed) throw new Error(`git diff ${base} ${head} failed; is ${base} fetched?`);

  const dirs = new Set(changed.map((f) => path.posix.dirname(f)).map((d) => (d === '.' ? '' : d)));
  const bumps: DetectedBump[] = [];

  for (const dir of [...dirs].sort()) {
    const manifestPath = dir ? `${dir}/package.json` : 'package.json';
    const lockPath = dir ? `${dir}/package-lock.json` : 'package-lock.json';
    const before = readJson<Manifest>(git(repoRoot, ['show', `${base}:${manifestPath}`]));
    const after = readJson<Manifest>(git(repoRoot, ['show', `${head}:${manifestPath}`]));
    if (!before || !after) continue;
    const lockBefore = readJson<Lockfile>(git(repoRoot, ['show', `${base}:${lockPath}`]));
    const lockAfter = readJson<Lockfile>(git(repoRoot, ['show', `${head}:${lockPath}`]));

    const resolve = (name: string, spec: string | undefined, lock: Lockfile | undefined): string | undefined =>
      lock?.packages?.[`node_modules/${name}`]?.version ?? exactVersion(spec);

    const names = new Set<string>();
    for (const field of DEP_FIELDS) {
      for (const n of Object.keys(before[field] ?? {})) names.add(n);
      for (const n of Object.keys(after[field] ?? {})) names.add(n);
    }
    for (const name of [...names].sort()) {
      const specBefore = DEP_FIELDS.map((f) => before[f]?.[name]).find(Boolean);
      const specAfter = DEP_FIELDS.map((f) => after[f]?.[name]).find(Boolean);
      if (!specBefore || !specAfter) continue; // added or removed, not bumped
      const from = resolve(name, specBefore, lockBefore);
      const to = resolve(name, specAfter, lockAfter);
      if (!from || !to || from === to) continue;
      bumps.push({ dir, pkg: name, from, to });
    }
  }
  return bumps;
}
