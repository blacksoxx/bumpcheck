import path from 'node:path';
import { readdirSync, statSync } from 'node:fs';
import ts from 'typescript';

export interface RepoConfig {
  options: ts.CompilerOptions;
  fileNames: string[];
  /** Where the options came from, for the report's meta. */
  source: 'tsconfig' | 'default';
}

export interface Target {
  pkg: string;
  /** Overlay root containing `node_modules/<pkg>`. */
  overlay: string;
}

export interface BuiltProgram {
  program: ts.Program;
  checker: ts.TypeChecker;
  /** Resolve a specifier (`pkg` or `pkg/sub`) against the overlay. */
  resolveTarget(specifier: string): ts.ResolvedModuleWithFailedLookupLocations;
}

const SOURCE_EXT = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next', '.turbo']);

export function isInside(root: string, file: string): boolean {
  const rel = path.relative(root, file);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

export function isTargetSpecifier(specifier: string, pkg: string): boolean {
  return specifier === pkg || specifier.startsWith(pkg + '/');
}

/**
 * Options we always force. We never emit, we never check library files, and
 * we do not want incremental state leaking across the two runs.
 */
function sanitize(options: ts.CompilerOptions): ts.CompilerOptions {
  const out: ts.CompilerOptions = { ...options };
  out.noEmit = true;
  out.skipLibCheck = true;
  delete out.incremental;
  delete out.composite;
  delete out.tsBuildInfoFile;
  delete out.outDir;
  delete out.outFile;
  delete out.declaration;
  delete out.declarationDir;
  delete out.declarationMap;
  delete out.sourceMap;
  delete out.emitDeclarationOnly;
  return out;
}

function walkSources(root: string): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = path.join(dir, entry);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) stack.push(full);
      else if (SOURCE_EXT.has(path.extname(entry)) && !entry.endsWith('.d.ts')) out.push(full);
    }
  }
  return out.sort();
}

export function loadRepoConfig(repoRoot: string): RepoConfig {
  const configPath = ts.findConfigFile(repoRoot, ts.sys.fileExists, 'tsconfig.json');
  if (configPath && (isInside(repoRoot, configPath) || path.dirname(configPath) === repoRoot)) {
    const raw = ts.readConfigFile(configPath, ts.sys.readFile);
    if (!raw.error) {
      const parsed = ts.parseJsonConfigFileContent(raw.config, ts.sys, path.dirname(configPath), undefined, configPath);
      if (parsed.fileNames.length > 0) {
        return { options: sanitize(parsed.options), fileNames: parsed.fileNames, source: 'tsconfig' };
      }
    }
  }
  return {
    options: sanitize({
      allowJs: true,
      checkJs: true,
      strict: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.Preserve,
      esModuleInterop: true,
      resolveJsonModule: true,
    }),
    fileNames: walkSources(repoRoot),
    source: 'default',
  };
}

/**
 * Builds a program over the repo where every import of the target package is
 * resolved from the overlay instead of the repo's own node_modules. Files
 * inside the overlay resolve normally, so the package's own dependencies work.
 */
export function buildProgram(repoRoot: string, config: RepoConfig, target: Target): BuiltProgram {
  const host = ts.createCompilerHost(config.options, true);
  const anchor = path.join(target.overlay, '__bumpcheck_anchor__.ts');
  const repoCache = ts.createModuleResolutionCache(repoRoot, host.getCanonicalFileName, config.options);
  const overlayCache = ts.createModuleResolutionCache(target.overlay, host.getCanonicalFileName, config.options);

  const resolveTarget = (specifier: string): ts.ResolvedModuleWithFailedLookupLocations =>
    ts.resolveModuleName(specifier, anchor, config.options, host, overlayCache);

  host.resolveModuleNameLiterals = (literals, containingFile, redirectedReference, options) =>
    literals.map((lit) => {
      if (isTargetSpecifier(lit.text, target.pkg) && !isInside(target.overlay, containingFile)) {
        return resolveTarget(lit.text);
      }
      return ts.resolveModuleName(lit.text, containingFile, options, host, repoCache, redirectedReference);
    });

  const program = ts.createProgram({ rootNames: config.fileNames, options: config.options, host });
  return { program, checker: program.getTypeChecker(), resolveTarget };
}
