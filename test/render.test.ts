import { describe, expect, it } from 'vitest';
import { renderMarkdown, renderText } from '../src/index.js';
import { normalizeDeclaration } from '../src/npm/exports.js';
import { analyzeFixture } from './helpers.js';

describe('normalizeDeclaration', () => {
  it('ignores whitespace and comments', () => {
    const a = normalizeDeclaration('export declare function f(\n  x: string // the x\n): void;');
    const b = normalizeDeclaration('/** doc */ export declare function f(x: string): void;');
    expect(a).toBe(b);
  });
  it('keeps real differences', () => {
    expect(normalizeDeclaration('f(x?: string): void')).not.toBe(normalizeDeclaration('f(x: string): void'));
  });
});

describe('renderers', () => {
  it('text leads with the headline and lists breaks with locations', async () => {
    const text = renderText(await analyzeFixture('1.0.0', '2.0.0'));
    expect(text.split('\n')[0]).toBe('demo-lib 1.0.0 -> 2.0.0');
    expect(text).toContain('9 breaks in 7 symbols');
    expect(text).toContain('src/main.ts:6:1');
    expect(text).toContain('Behavior not checked');
  });

  it('text says none changed for a no-op bump', async () => {
    const text = renderText(await analyzeFixture('1.0.0', '1.0.0'));
    expect(text).toContain('None changed.');
    expect(text).not.toContain('BREAKS');
  });

  it('markdown is a single comment with a sub footer', async () => {
    const md = renderMarkdown(await analyzeFixture('1.0.0', '2.0.0'));
    expect(md.startsWith('### `demo-lib` 1.0.0 → 2.0.0')).toBe(true);
    expect(md).toContain('**Breaks**');
    expect(md).toContain('`src/main.ts:6:1`');
    expect(md.trim().endsWith('</sub>')).toBe(true);
  });
});

describe('grouping and clips', () => {
  it('groups breaks with the same cause and collapses their sites', async () => {
    const report = await analyzeFixture('1.0.0', '2.0.0');
    // Two fetchThing sites share one cause: main.ts:12 and indirect.ts:6.
    const text = renderText(report);
    expect(text).toContain("fetchThing  Property 'name' does not exist on type '{…}'.  TS2339  (2 sites)");
    const md = renderMarkdown(report);
    expect(md).toContain('<details><summary>2 sites</summary>');
  });

  it('shows the region that differs, not identical prefixes', async () => {
    const report = await analyzeFixture('1.0.0', '2.0.0');
    const text = renderText(report);
    expect(text).toContain('before: export declare function greet ( name : string , greeting ? : string ) : string ;');
    expect(text).toContain('after:  export declare function greet ( name : string , options ? : { greeting : string } ) : string ;');
  });
});
