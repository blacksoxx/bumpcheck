import { beforeAll, describe, expect, it } from 'vitest';
import { analyzeFixture } from './helpers.js';
import type { Report } from '../src/index.js';

function byName(r: Report, name: string) {
  const hit = r.imports.find((i) => i.name === name);
  if (!hit) throw new Error(`no import named ${name}`);
  return hit;
}

describe('demo-lib 1.0.0 -> 2.0.0', () => {
  let report: Report;
  beforeAll(async () => {
    report = await analyzeFixture('1.0.0', '2.0.0');
  });

  it('finds every file that imports the package and no others', () => {
    expect(report.files).toEqual(['src/dyn.ts', 'src/extra.ts', 'src/legacy.js', 'src/main.ts', 'src/ns.ts', 'src/synthetic.ts']);
  });

  it('reports exactly the planted breaks, with line numbers and attribution', () => {
    const compact = report.breaks.map((b) => [b.kind, b.symbol, `${b.location.file}:${b.location.line}`, b.attribution]);
    expect(compact).toEqual([
      ['arity', 'extra', 'src/extra.ts:3', 'binding'],
      ['missing-member', 'fetchThing', 'src/indirect.ts:6', 'type'],
      ['type-mismatch', 'greet', 'src/legacy.js:3', 'binding'],
      ['removed-export', 'oldFn', 'src/main.ts:1', 'message'],
      ['arity', 'configure', 'src/main.ts:6', 'binding'],
      ['missing-member', 'fetchThing', 'src/main.ts:12', 'type'],
      ['type-mismatch', 'greet', 'src/main.ts:15', 'binding'],
      ['type-mismatch', 'default', 'src/main.ts:19', 'type'],
      ['arity', 'default', 'src/synthetic.ts:4', 'binding'],
    ]);
  });

  it('finds breaks in files that never import the package', () => {
    const indirect = report.breaks.filter((b) => b.location.file === 'src/indirect.ts');
    expect(indirect).toHaveLength(1);
    expect(report.files).not.toContain('src/indirect.ts');
  });

  it('folds implicit-any cascades into their root cause', () => {
    const line12 = report.breaks.filter((b) => b.location.file === 'src/main.ts' && b.location.line === 12);
    expect(line12.map((b) => b.code)).toEqual([2339]);
  });

  it('describes namespace changes by member', () => {
    const helpers = byName(report, 'helpers');
    expect(helpers.status).toBe('changed');
    expect(helpers.change?.before).toBe('namespace with 1 members');
    expect(helpers.change?.after).toBe('namespace with 2 members; added: b');
  });

  it('checks a synthetic default import against the module itself', () => {
    const synthetic = report.imports.find((i) => i.name === 'default' && i.specifier === 'demo-lib/extra');
    expect(synthetic?.status).toBe('breaking');
  });

  it('does not report the pre-existing error that both versions share', () => {
    expect(report.breaks.some((b) => b.location.line === 3 && b.location.file === 'src/main.ts')).toBe(false);
  });

  it('classifies each imported symbol', () => {
    expect(byName(report, 'oldFn').status).toBe('removed');
    expect(byName(report, 'configure').status).toBe('breaking');
    expect(byName(report, 'greet').status).toBe('breaking');
    expect(byName(report, 'extra').status).toBe('breaking');
    expect(byName(report, 'fetchThing').status).toBe('breaking');
    expect(byName(report, 'default').status).toBe('breaking');
    expect(byName(report, 'Options').status).toBe('unchanged');
    expect(byName(report, 'VERSION').status).toBe('unchanged');
  });

  it('treats a doc-comment-only change as unchanged', () => {
    expect(byName(report, 'stable').status).toBe('unchanged');
  });

  it('merges namespace member accesses into the same symbol', () => {
    const files = byName(report, 'stable').locations.map((l) => l.file);
    expect(files).toContain('src/ns.ts');
    expect(files).toContain('src/main.ts');
    expect(files).toContain('src/legacy.js');
  });

  it('reports what it cannot analyze instead of guessing', () => {
    const reasons = report.unanalyzed.map((u) => u.reason).sort();
    expect(reasons).toEqual([
      '1 file imports "demo-lib" but is outside tsconfig.json, so neither tsc nor bumpcheck checks it',
      '1 other package could not be resolved (demo-ambient); install dependencies for full coverage',
      'dynamic import("demo-lib")',
      'uses the whole module "demo-lib" as a value',
    ]);
    const outside = report.unanalyzed.find((u) => u.reason.includes('outside tsconfig'));
    expect(outside?.locations.map((l) => l.file)).toEqual(['scripts-outside.ts']);
  });

  it('keeps a consistent summary', () => {
    expect(report.summary).toMatchObject({
      importedSymbols: 11,
      unchanged: 3,
      changed: 1,
      breaking: 6,
      removed: 1,
      unknown: 0,
      breaks: 9,
    });
  });

  it('is deterministic', async () => {
    const again = await analyzeFixture('1.0.0', '2.0.0');
    const strip = (r: Report) => JSON.stringify({ ...r, meta: { ...r.meta, durationMs: 0 } });
    expect(strip(again)).toBe(strip(report));
  });
});

describe('demo-lib 1.0.0 -> 1.0.0', () => {
  it('reports nothing changed and no breaks', async () => {
    const report = await analyzeFixture('1.0.0', '1.0.0');
    expect(report.breaks).toEqual([]);
    expect(report.imports.every((i) => i.status === 'unchanged')).toBe(true);
    expect(report.summary.breaks).toBe(0);
  });
});

describe('demo-ambient 1.0.0 -> 2.0.0 (declare module style types)', () => {
  it('reads exports from an ambient module declaration and finds the break', async () => {
    const report = await analyzeFixture('1.0.0', '2.0.0', 'demo-ambient');
    expect(report.meta.untyped).toBe(false);
    expect(report.imports.map((i) => [i.name, i.status])).toEqual([
      ['connect', 'breaking'],
      ['version', 'unchanged'],
    ]);
    expect(report.breaks.map((b) => [b.kind, b.symbol, b.location.file, b.location.line])).toEqual([
      ['arity', 'connect', 'src/ambient.ts', 3],
    ]);
  });
});
