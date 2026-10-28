/**
 * The report is the product. Every surface (CLI, PR comment, JSON) renders
 * from this structure. Keep it small and keep every field a verifiable fact.
 */

export const SCHEMA_VERSION = 1 as const;

export interface Location {
  /** Path relative to the repo root, POSIX separators. */
  file: string;
  /** 1-based line. */
  line: number;
  /** 1-based column. */
  column: number;
}

export type SymbolStatus =
  /** Declaration text is identical between versions. */
  | 'unchanged'
  /** Declaration changed, but every use still typechecks. */
  | 'changed'
  /** Declaration changed and at least one use no longer typechecks. */
  | 'breaking'
  /** Symbol no longer exported by the new version. */
  | 'removed'
  /** Could not be resolved in one or both versions (untyped, `any`, missing types). */
  | 'unknown';

export interface ImportedSymbol {
  /** Exported name as seen by the consumer. `default` for default imports. */
  name: string;
  /** Module specifier as written, e.g. `axios` or `axios/lib/adapters`. */
  specifier: string;
  status: SymbolStatus;
  /** Every place the symbol is imported or accessed. */
  locations: Location[];
  /** Present when status is `changed` or `removed`. */
  change?: SymbolChange;
}

export interface SymbolChange {
  /** Normalized declaration text in the old version, if any. */
  before?: string;
  /** Normalized declaration text in the new version, if any. */
  after?: string;
}

export type BreakKind =
  /** Import of a name the new version no longer exports. */
  | 'removed-export'
  /** Subpath or entry the new version no longer resolves. */
  | 'missing-module'
  /** Call passes the wrong number of arguments for the new signature. */
  | 'arity'
  /** Argument, assignment, or return no longer matches the new types. */
  | 'type-mismatch'
  /** Property or member access that the new types do not have. */
  | 'missing-member'
  /** A TypeScript error attributable to the bump that fits no bucket above. */
  | 'other';

export interface Break {
  kind: BreakKind;
  location: Location;
  /** TypeScript's own message, flattened to one line. */
  message: string;
  /** TypeScript diagnostic code, so a reader can look it up. */
  code: number;
  /** The imported symbol this error involves, when it can be determined. */
  symbol?: string;
  /** How it was determined: the error names it, the statement uses it, or a type declared under it is involved. */
  attribution?: 'message' | 'binding' | 'type';
}

export interface Unanalyzed {
  reason: string;
  locations: Location[];
}

export interface Summary {
  importedSymbols: number;
  unchanged: number;
  changed: number;
  breaking: number;
  removed: number;
  unknown: number;
  breaks: number;
  unanalyzed: number;
}

export interface Report {
  schemaVersion: typeof SCHEMA_VERSION;
  ecosystem: 'npm';
  package: string;
  from: string;
  to: string;
  /** Files in the repo that import the package, relative paths. */
  files: string[];
  imports: ImportedSymbol[];
  breaks: Break[];
  unanalyzed: Unanalyzed[];
  summary: Summary;
  meta: {
    typescript: string;
    durationMs: number;
    /** True when the new version ships no type declarations; nothing could be proven. */
    untyped: boolean;
  };
}
