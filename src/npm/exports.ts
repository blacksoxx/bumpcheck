import ts from 'typescript';
import type { BuiltProgram } from './program.js';

export interface ModuleExports {
  /** False when the specifier does not resolve at all in this version. */
  resolved: boolean;
  /** False when it resolves only to JavaScript with no declarations. */
  typed: boolean;
  /** Export name -> normalized declaration text. */
  exports: Map<string, string>;
}

/**
 * Collapses a declaration to its tokens so formatting and comments do not
 * count as changes. Two declarations with the same tokens are the same API.
 */
export function normalizeDeclaration(text: string): string {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, text);
  const parts: string[] = [];
  let kind = scanner.scan();
  while (kind !== ts.SyntaxKind.EndOfFileToken) {
    parts.push(scanner.getTokenText());
    kind = scanner.scan();
  }
  return parts.join(' ');
}

const TS_EXTENSIONS = new Set<string>([
  ts.Extension.Ts,
  ts.Extension.Tsx,
  ts.Extension.Dts,
  ts.Extension.Mts,
  ts.Extension.Cts,
  ts.Extension.Dmts,
  ts.Extension.Dcts,
]);

export const NAMESPACE_PREFIX = 'namespace:';
const MEMBER_SEP = '\u0002';
const SIG_SEP = '\u0001';

function isModuleLike(sym: ts.Symbol): boolean {
  if (sym.flags & (ts.SymbolFlags.ValueModule | ts.SymbolFlags.NamespaceModule)) return true;
  return (sym.declarations ?? []).some((d) => ts.isSourceFile(d) || ts.isModuleDeclaration(d));
}

/** Parses a namespace signature back into member -> member signature. */
export function namespaceMembers(signature: string): Map<string, string> | undefined {
  if (!signature.startsWith(NAMESPACE_PREFIX)) return undefined;
  const out = new Map<string, string>();
  for (const entry of signature.slice(NAMESPACE_PREFIX.length).split(MEMBER_SEP)) {
    if (!entry) continue;
    const i = entry.indexOf(SIG_SEP);
    out.set(i < 0 ? entry : entry.slice(0, i), i < 0 ? '' : entry.slice(i + 1));
  }
  return out;
}

function symbolSignature(checker: ts.TypeChecker, sym: ts.Symbol, depth = 0): string {
  const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
  if (isModuleLike(target)) {
    // A namespace is its members and their signatures. Nested namespaces
    // one level down are listed by name only, to keep this bounded.
    const members = checker
      .getExportsOfModule(target)
      .map((e) => (depth === 0 ? `${e.name}${SIG_SEP}${symbolSignature(checker, e, depth + 1)}` : e.name))
      .sort();
    return NAMESPACE_PREFIX + members.join(MEMBER_SEP);
  }
  const decls = target.declarations ?? [];
  if (decls.length === 0) {
    // No declaration (e.g. synthesized `export =` members). Fall back to the type.
    return normalizeDeclaration(checker.typeToString(checker.getTypeOfSymbol(target), undefined, ts.TypeFormatFlags.NoTruncation));
  }
  return decls
    .map((d) => normalizeDeclaration(d.getText()))
    .sort()
    .join('\n');
}

/**
 * Lists the public exports of `specifier` as resolved against the overlay,
 * with a normalized signature per export.
 */
export function getModuleExports(built: BuiltProgram, specifier: string): ModuleExports {
  const { program, checker, resolveTarget } = built;
  const resolution = resolveTarget(specifier).resolvedModule;
  if (!resolution) return { resolved: false, typed: false, exports: new Map() };
  if (!TS_EXTENSIONS.has(resolution.extension)) return { resolved: true, typed: false, exports: new Map() };

  const sf = program.getSourceFile(resolution.resolvedFileName);
  if (!sf) return { resolved: true, typed: false, exports: new Map() };

  const moduleSymbol = checker.getSymbolAtLocation(sf);
  if (!moduleSymbol) return { resolved: true, typed: false, exports: new Map() };

  const exports = new Map<string, string>();
  for (const sym of checker.getExportsOfModule(moduleSymbol)) {
    exports.set(sym.name, symbolSignature(checker, sym));
  }

  // `import x from 'pkg'` compiles against a module with no default export
  // when synthetic defaults are allowed; the default is then the module
  // itself. Mirror that so the import is checked instead of marked unknown.
  const options = program.getCompilerOptions();
  const synthetic = options.allowSyntheticDefaultImports ?? options.esModuleInterop ?? false;
  if (!exports.has('default') && synthetic) {
    exports.set('default', symbolSignature(checker, moduleSymbol));
  }
  return { resolved: true, typed: true, exports };
}
