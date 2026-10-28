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

function symbolSignature(checker: ts.TypeChecker, sym: ts.Symbol): string {
  const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
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
  return { resolved: true, typed: true, exports };
}
