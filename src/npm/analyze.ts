import path from 'node:path';
import { realpathSync } from 'node:fs';
import ts from 'typescript';
import type { ImportedSymbol, Report, Summary, Unanalyzed } from '../types.js';
import { SCHEMA_VERSION } from '../types.js';
import type { PackageProvider } from '../registry/provider.js';
import { buildProgram, isInside, loadRepoConfig } from './program.js';
import { scanImports } from './imports.js';
import { getModuleExports, namespaceMembers, type ModuleExports } from './exports.js';
import { collectDiagnostics, diffDiagnostics } from './diagnostics.js';

export interface AnalyzeOptions {
  repoRoot: string;
  pkg: string;
  from: string;
  to: string;
  provider: PackageProvider;
}

/**
 * For namespaces, say which members came and went instead of dumping two
 * member lists. Everything else is shown as the normalized declaration.
 */
function describeChange(before: string, after: string): { before: string; after: string } {
  const a = namespaceMembers(before);
  const b = namespaceMembers(after);
  if (!a || !b) return { before, after };
  const removed = [...a.keys()].filter((n) => !b.has(n));
  const added = [...b.keys()].filter((n) => !a.has(n));
  const changed = [...a.keys()].filter((n) => b.has(n) && a.get(n) !== b.get(n));
  const list = (xs: string[]) => (xs.length > 12 ? xs.slice(0, 12).join(', ') + `, +${xs.length - 12} more` : xs.join(', '));
  const parts = [`namespace with ${b.size} members`];
  if (removed.length) parts.push(`removed: ${list(removed)}`);
  if (added.length) parts.push(`added: ${list(added)}`);
  if (changed.length) parts.push(`changed: ${list(changed)}`);
  return { before: `namespace with ${a.size} members`, after: parts.join('; ') };
}

/**
 * The whole pipeline:
 *   1. materialize both versions,
 *   2. build one program per version with imports redirected,
 *   3. collect what the repo imports,
 *   4. compare each imported symbol's declaration,
 *   5. diff the type errors; new-only errors are the breaks.
 */
export async function analyzeNpm(opts: AnalyzeOptions): Promise<Report> {
  const started = Date.now();
  const repoRoot = path.resolve(opts.repoRoot);
  // TypeScript reports node_modules files by real path, so compare against
  // real paths too (macOS tmp dirs live behind a symlink, for example).
  const overlayFrom = realpathSync(await opts.provider.ensure(opts.pkg, opts.from));
  const overlayTo = opts.to === opts.from ? overlayFrom : realpathSync(await opts.provider.ensure(opts.pkg, opts.to));

  const config = loadRepoConfig(repoRoot);
  const before = buildProgram(repoRoot, config, { pkg: opts.pkg, overlay: overlayFrom });
  const after = buildProgram(repoRoot, config, { pkg: opts.pkg, overlay: overlayTo });

  // Imports are a property of the repo, not of the version, so either
  // program would do; the "after" program keeps attribution consistent.
  const scan = scanImports(repoRoot, after, opts.pkg, overlayTo);

  // Breaks can surface in files that never import the package, when a type
  // from it flows through another module. So every repo source file is
  // checked; the differential keeps unrelated errors out.
  const absoluteFiles = after.program
    .getSourceFiles()
    .filter((sf) => !sf.isDeclarationFile && isInside(repoRoot, sf.fileName) && !sf.fileName.includes(`${path.sep}node_modules${path.sep}`))
    .map((sf) => sf.fileName);

  const specifiers = [...new Set(scan.refs.map((r) => r.specifier))];
  const exportsBefore = new Map<string, ModuleExports>();
  const exportsAfter = new Map<string, ModuleExports>();
  for (const spec of specifiers) {
    exportsBefore.set(spec, getModuleExports(before, spec));
    exportsAfter.set(spec, getModuleExports(after, spec));
  }

  // "Untyped" means every imported entry resolves to JavaScript with no
  // declarations. A specifier that does not resolve at all is a different
  // fact: the diagnostics diff reports it as a missing module. When nothing
  // imports the package, neither claim applies.
  const afterEntries = [...exportsAfter.values()];
  const untyped = afterEntries.length > 0 && afterEntries.every((e) => e.resolved && !e.typed);

  const unanalyzed: Unanalyzed[] = [...scan.unanalyzed];
  const imports: ImportedSymbol[] = scan.refs.map((ref) => {
    const b = exportsBefore.get(ref.specifier)!;
    const a = exportsAfter.get(ref.specifier)!;
    const sigBefore = b.exports.get(ref.name);
    const sigAfter = a.exports.get(ref.name);

    if (!a.typed || !b.typed) {
      return { ...ref, status: 'unknown' };
    }
    if (sigBefore === undefined && sigAfter === undefined) {
      // Neither version declares it. Likely a typo in the repo or a symbol
      // only present at runtime. Both runs report the same error, which cancels.
      return { ...ref, status: 'unknown' };
    }
    if (sigAfter === undefined) {
      return { ...ref, status: 'removed', change: { before: sigBefore! } };
    }
    if (sigBefore === undefined) {
      // New in the target version yet already imported: the repo must have
      // been compiling against something else. Report honestly as unknown.
      return { ...ref, status: 'unknown', change: { after: sigAfter } };
    }
    if (sigBefore === sigAfter) return { ...ref, status: 'unchanged' };
    return { ...ref, status: 'changed', change: describeChange(sigBefore, sigAfter) };
  });

  if (untyped) {
    unanalyzed.push({
      reason: `${opts.pkg}@${opts.to} ships no type declarations and none were found on DefinitelyTyped; nothing can be proven`,
      locations: [],
    });
  }
  for (const spec of specifiers) {
    const a = exportsAfter.get(spec)!;
    const b = exportsBefore.get(spec)!;
    if (b.resolved && !a.resolved) {
      unanalyzed.push({
        reason: `"${spec}" does not resolve in ${opts.to} under this repo's module resolution; see breaks`,
        locations: scan.refs.filter((r) => r.specifier === spec).flatMap((r) => r.locations),
      });
      continue;
    }
    if (a.resolved && !a.typed && !untyped) {
      unanalyzed.push({
        reason: `"${spec}" resolves to JavaScript without declarations in ${opts.to}`,
        locations: scan.refs.filter((r) => r.specifier === spec).flatMap((r) => r.locations),
      });
    }
  }

  const breaks = untyped
    ? []
    : diffDiagnostics(
        repoRoot,
        collectDiagnostics(before, absoluteFiles),
        collectDiagnostics(after, absoluteFiles),
        scan,
        after,
        overlayTo,
      );

  // A changed declaration with a break attributed to it is breaking, not
  // merely changed. Removed symbols keep their own status.
  const brokenSymbols = new Set(breaks.map((b) => b.symbol).filter((s): s is string => !!s));
  for (const imp of imports) {
    if (imp.status === 'changed' && brokenSymbols.has(imp.name)) imp.status = 'breaking';
  }

  const summary: Summary = {
    importedSymbols: imports.length,
    unchanged: imports.filter((i) => i.status === 'unchanged').length,
    changed: imports.filter((i) => i.status === 'changed').length,
    breaking: imports.filter((i) => i.status === 'breaking').length,
    removed: imports.filter((i) => i.status === 'removed').length,
    unknown: imports.filter((i) => i.status === 'unknown').length,
    breaks: breaks.length,
    unanalyzed: unanalyzed.reduce((n, u) => n + Math.max(1, u.locations.length), 0),
  };

  return {
    schemaVersion: SCHEMA_VERSION,
    ecosystem: 'npm',
    package: opts.pkg,
    from: opts.from,
    to: opts.to,
    files: scan.files,
    imports,
    breaks,
    unanalyzed,
    summary,
    meta: { typescript: ts.version, durationMs: Date.now() - started, untyped },
  };
}
