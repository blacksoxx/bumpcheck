import ts from 'typescript';
import type { Break, BreakKind, Location } from '../types.js';
import { isInside, type BuiltProgram } from './program.js';
import { toLocation, type ImportScan } from './imports.js';

interface Keyed {
  key: string;
  diagnostic: ts.DiagnosticWithLocation;
}

function flatten(d: ts.Diagnostic): string {
  return ts.flattenDiagnosticMessageText(d.messageText, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Semantic diagnostics for the given files, keyed so two runs over the same
 * sources can be diffed. Position is part of the key: the sources are
 * identical in both runs, so a shift cannot occur.
 */
export function collectDiagnostics(built: BuiltProgram, absoluteFiles: string[]): Map<string, Keyed> {
  const out = new Map<string, Keyed>();
  for (const file of absoluteFiles) {
    const sf = built.program.getSourceFile(file);
    if (!sf) continue;
    for (const d of built.program.getSemanticDiagnostics(sf)) {
      if (d.file === undefined || d.start === undefined) continue;
      if (d.category !== ts.DiagnosticCategory.Error) continue;
      const key = `${d.file.fileName}\u0000${d.code}\u0000${d.start}\u0000${flatten(d)}`;
      out.set(key, { key, diagnostic: d as ts.DiagnosticWithLocation });
    }
  }
  return out;
}

/**
 * Errors TypeScript emits as a consequence of another error in the same
 * statement, such as "implicitly has an 'any' type" once a property lookup
 * failed. Reported only when they stand alone.
 */
const CASCADE_CODES = new Set([7005, 7006, 7031, 7034, 7053]);

const KIND_BY_CODE: Record<number, BreakKind> = {
  1192: 'removed-export', // Module has no default export
  2305: 'removed-export', // Module has no exported member
  2614: 'removed-export', // ... has no exported member; did you mean to use import x from?
  2724: 'removed-export', // ... has no exported member named; did you mean?
  2307: 'missing-module',
  2792: 'missing-module',
  2554: 'arity',
  2555: 'arity',
  2556: 'arity',
  2557: 'arity',
  2322: 'type-mismatch',
  2345: 'type-mismatch',
  2353: 'type-mismatch',
  2559: 'type-mismatch',
  2739: 'type-mismatch',
  2740: 'type-mismatch',
  2741: 'type-mismatch',
  2769: 'type-mismatch',
  2339: 'missing-member',
  2551: 'missing-member',
};

function findNodeAt(sf: ts.SourceFile, pos: number): ts.Node {
  let best: ts.Node = sf;
  const visit = (node: ts.Node) => {
    if (pos >= node.getStart(sf) && pos < node.getEnd()) {
      best = node;
      ts.forEachChild(node, visit);
    }
  };
  ts.forEachChild(sf, visit);
  return best;
}

function enclosingStatement(node: ts.Node): ts.Node {
  let n = node;
  while (n.parent && !ts.isStatement(n) && !ts.isSourceFile(n.parent)) n = n.parent;
  return n;
}

/**
 * Per file: the package symbol each import binding points at, so a type
 * declared under that symbol can be traced back to the imported name.
 */
function importTargets(checker: ts.TypeChecker, sf: ts.SourceFile, locals: Map<string, { name: string }>): Map<ts.Symbol, string> {
  const out = new Map<ts.Symbol, string>();
  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node) && locals.has(node.text)) {
      const parent = node.parent;
      const isBinding =
        (parent && ts.isImportClause(parent) && parent.name === node) ||
        (parent && ts.isImportSpecifier(parent) && parent.name === node) ||
        (parent && ts.isBindingElement(parent) && parent.name === node);
      if (isBinding) {
        const sym = checker.getSymbolAtLocation(node);
        if (sym) {
          const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
          out.set(target, locals.get(node.text)!.name);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

function topLevelSymbol(checker: ts.TypeChecker, decl: ts.Node): ts.Symbol | undefined {
  let n: ts.Node = decl;
  while (n.parent && !ts.isSourceFile(n.parent)) n = n.parent;
  if (ts.isVariableStatement(n)) n = n.declarationList.declarations[0] ?? n;
  const name = (n as ts.NamedDeclaration).name;
  return name ? checker.getSymbolAtLocation(name) : undefined;
}

/**
 * Attributes a diagnostic to one of the file's imported names. Three
 * strategies, in order of certainty; returns nothing rather than guess.
 */
function attribute(
  built: BuiltProgram,
  overlay: string,
  sf: ts.SourceFile,
  d: ts.DiagnosticWithLocation,
  locals: Map<string, { name: string }> | undefined,
  targets: Map<ts.Symbol, string> | undefined,
  message: string,
): { symbol: string; attribution: Break['attribution'] } | undefined {
  const fromMessage = /has no exported member (?:named )?'([^']+)'/.exec(message);
  if (fromMessage) return { symbol: fromMessage[1]!, attribution: 'message' };

  const { checker } = built;
  const statement = enclosingStatement(findNodeAt(sf, d.start));

  // Walk outward from the error. The innermost node that mentions an import
  // binding wins, so `a(x) + b(y)` attributes to the call that failed.
  if (locals && locals.size > 0) {
    for (let node: ts.Node = findNodeAt(sf, d.start); ; node = node.parent) {
      const viaBinding = findBinding(node, locals);
      if (viaBinding) return { symbol: viaBinding, attribution: 'binding' };
      if (node === statement) break;
    }
  }

  // Same walk, but for values whose type is declared under one of the imports.
  if (!targets || targets.size === 0) return undefined;
  for (let node: ts.Node = findNodeAt(sf, d.start); ; node = node.parent) {
    const viaType = findType(node, checker, overlay, targets);
    if (viaType) return { symbol: viaType, attribution: 'type' };
    if (node === statement) break;
  }
  return undefined;
}

function findBinding(root: ts.Node, locals: Map<string, { name: string }>): string | undefined {
  let found: string | undefined;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isIdentifier(n) && locals.has(n.text)) found = locals.get(n.text)!.name;
    else ts.forEachChild(n, visit);
  };
  visit(root);
  return found;
}

/**
 * Members of namespace-like imports (`import { z } from 'zod'`), so a type
 * declared as `ZodError` can be traced to the `z` the file actually imports.
 */
function namespaceMembers(checker: ts.TypeChecker, targets: Map<ts.Symbol, string>): Map<ts.Symbol, string> {
  const out = new Map<ts.Symbol, string>();
  for (const [sym, name] of targets) {
    const isModule =
      sym.flags & (ts.SymbolFlags.ValueModule | ts.SymbolFlags.NamespaceModule) ||
      (sym.declarations ?? []).some((d) => ts.isSourceFile(d) || ts.isModuleDeclaration(d));
    if (!isModule) continue;
    for (const member of checker.getExportsOfModule(sym)) {
      const resolved = member.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(member) : member;
      if (!out.has(resolved)) out.set(resolved, name);
    }
  }
  return out;
}

function findType(root: ts.Node, checker: ts.TypeChecker, overlay: string, targets: Map<ts.Symbol, string>): string | undefined {
  let found: string | undefined;
  let members: Map<ts.Symbol, string> | undefined;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isExpression(n) || ts.isIdentifier(n)) {
      const type = checker.getTypeAtLocation(n);
      for (const sym of [type.aliasSymbol, type.symbol]) {
        if (!sym) continue;
        for (const decl of sym.declarations ?? []) {
          if (!isInside(overlay, decl.getSourceFile().fileName)) continue;
          const top = topLevelSymbol(checker, decl);
          if (!top) continue;
          let name = targets.get(top);
          if (!name) {
            members ??= namespaceMembers(checker, targets);
            name = members.get(top);
          }
          if (name) {
            found = name;
            return;
          }
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(root);
  return found;
}

/**
 * Errors present with the new version and absent with the old one are the
 * breaks. Everything else cancels out, including the repo's pre-existing
 * type errors and any noise from unresolved unrelated packages.
 */
export function diffDiagnostics(
  repoRoot: string,
  before: Map<string, Keyed>,
  after: Map<string, Keyed>,
  scan: ImportScan,
  built: BuiltProgram,
  overlay: string,
): Break[] {
  const breaks: Break[] = [];
  const targetsByFile = new Map<string, Map<ts.Symbol, string>>();

  // Files that never import the package still get type-based attribution,
  // against everything the repo imports from it anywhere.
  let repoTargets: Map<ts.Symbol, string> | undefined;
  const allTargets = (): Map<ts.Symbol, string> => {
    if (repoTargets) return repoTargets;
    repoTargets = new Map();
    for (const [file, locals] of scan.localNames) {
      const sf = built.program.getSourceFile(file);
      if (!sf) continue;
      for (const [sym, name] of importTargets(built.checker, sf, locals)) {
        if (!repoTargets.has(sym)) repoTargets.set(sym, name);
      }
    }
    return repoTargets;
  };
  const fresh = [...after.entries()].filter(([key]) => !before.has(key)).map(([, v]) => v.diagnostic);

  const statementKey = (d: ts.DiagnosticWithLocation): string => {
    const st = enclosingStatement(findNodeAt(d.file, d.start));
    return `${d.file.fileName}\u0000${st.getStart(d.file)}`;
  };
  const rootCauses = new Set(fresh.filter((d) => !CASCADE_CODES.has(d.code)).map(statementKey));

  for (const diagnostic of fresh) {
    if (CASCADE_CODES.has(diagnostic.code) && rootCauses.has(statementKey(diagnostic))) continue;
    const sf = diagnostic.file;
    const message = flatten(diagnostic);
    const location: Location = toLocation(repoRoot, sf, { getStart: () => diagnostic.start } as ts.Node);
    const locals = scan.localNames.get(sf.fileName);
    let targets = targetsByFile.get(sf.fileName);
    if (!targets) {
      targets = locals ? importTargets(built.checker, sf, locals) : allTargets();
      targetsByFile.set(sf.fileName, targets);
    }
    const attributed = attribute(built, overlay, sf, diagnostic, locals, targets, message);
    const b: Break = {
      kind: KIND_BY_CODE[diagnostic.code] ?? 'other',
      location,
      message,
      code: diagnostic.code,
    };
    if (attributed) {
      b.symbol = attributed.symbol;
      if (attributed.attribution) b.attribution = attributed.attribution;
    }
    breaks.push(b);
  }
  return breaks.sort((a, b) =>
    a.location.file === b.location.file
      ? a.location.line - b.location.line || a.location.column - b.location.column
      : a.location.file.localeCompare(b.location.file),
  );
}
