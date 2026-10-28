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
    expect(text).toContain('7 breaks in 6 symbols');
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
