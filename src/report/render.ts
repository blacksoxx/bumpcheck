import type { Break, ImportedSymbol, Location, Report } from '../types.js';

const MAX_SIG = 160;

function loc(l: Location): string {
  return `${l.file}:${l.line}:${l.column}`;
}

function clip(s: string | undefined): string {
  if (!s) return '';
  const one = s.replace(/\n/g, ' ⏎ ');
  return one.length > MAX_SIG ? one.slice(0, MAX_SIG - 1) + '…' : one;
}

function headline(r: Report): string {
  const n = r.summary.importedSymbols;
  const what = n === 1 ? '1 symbol' : `${n} symbols`;
  if (r.meta.untyped) {
    return `You import ${what} from ${r.package}. ${r.to} ships no type declarations, so nothing could be checked.`;
  }
  if (n === 0) {
    return `Nothing in this repo imports ${r.package}.`;
  }
  const s = r.summary;
  const parts: string[] = [];
  if (s.breaks > 0) {
    const affected = s.removed + s.breaking;
    parts.push(`${s.breaks} break${s.breaks === 1 ? '' : 's'} in ${affected} symbol${affected === 1 ? '' : 's'}`);
  }
  if (s.changed > 0) parts.push(`${s.changed} changed but still typecheck${s.changed === 1 ? 's' : ''}`);
  if (s.unknown > 0) parts.push(`${s.unknown} could not be checked`);
  const tail = parts.length === 0 ? 'None changed.' : parts.join(', ') + '.';
  return `You import ${what} from ${r.package}. ${tail} Behavior not checked.`;
}

function breakLine(b: Break): string {
  const sym = b.symbol ? `${b.symbol}  ` : '';
  return `  ${sym}${b.message}\n    ${loc(b.location)}  (TS${b.code})`;
}

function section(title: string, items: ImportedSymbol[], out: string[]): void {
  if (items.length === 0) return;
  out.push(title);
  for (const s of items) out.push(symbolLine(s));
  out.push('');
}

function symbolLine(s: ImportedSymbol): string {
  const sig =
    s.status === 'changed' || s.status === 'breaking'
      ? `\n    before: ${clip(s.change?.before)}\n    after:  ${clip(s.change?.after)}`
      : s.status === 'removed'
        ? `\n    was: ${clip(s.change?.before)}`
        : '';
  const locs = s.locations.map((l) => `    ${loc(l)}`).join('\n');
  return `  ${s.name}  [${s.specifier}]${sig}\n${locs}`;
}

/** Plain text for terminals. No color codes, so it pastes cleanly anywhere. */
export function renderText(r: Report): string {
  const out: string[] = [];
  out.push(`${r.package} ${r.from} -> ${r.to}`);
  out.push(headline(r));
  out.push('');

  if (r.breaks.length > 0) {
    out.push('BREAKS');
    for (const b of r.breaks) out.push(breakLine(b));
    out.push('');
  }
  section('REMOVED', r.imports.filter((i) => i.status === 'removed'), out);
  section('CHANGED, BREAKS ABOVE', r.imports.filter((i) => i.status === 'breaking'), out);
  section('CHANGED, STILL TYPECHECKS', r.imports.filter((i) => i.status === 'changed'), out);
  section('COULD NOT BE CHECKED', r.imports.filter((i) => i.status === 'unknown'), out);
  if (r.unanalyzed.length > 0) {
    out.push('NOT ANALYZED');
    for (const u of r.unanalyzed) {
      out.push(`  ${u.reason}`);
      for (const l of u.locations) out.push(`    ${loc(l)}`);
    }
    out.push('');
  }
  const unchanged = r.imports.filter((i) => i.status === 'unchanged');
  if (unchanged.length > 0) {
    out.push(`UNCHANGED (${unchanged.length})`);
    out.push('  ' + unchanged.map((s) => s.name).join(', '));
    out.push('');
  }
  out.push(`Checked ${r.files.length} file${r.files.length === 1 ? '' : 's'} with TypeScript ${r.meta.typescript} in ${r.meta.durationMs} ms.`);
  return out.join('\n');
}

/** GitHub-flavored markdown for a pull request comment. */
export function renderMarkdown(r: Report): string {
  const out: string[] = [];
  out.push(`### \`${r.package}\` ${r.from} → ${r.to}`);
  out.push('');
  out.push(headline(r));
  out.push('');

  if (r.breaks.length > 0) {
    out.push('**Breaks**');
    out.push('');
    for (const b of r.breaks) {
      const sym = b.symbol ? `\`${b.symbol}\` ` : '';
      out.push(`- ${sym}${b.message}  `);
      out.push(`  \`${loc(b.location)}\` (TS${b.code})`);
    }
    out.push('');
  }
  const removed = r.imports.filter((i) => i.status === 'removed');
  if (removed.length > 0) {
    out.push('**Removed**');
    out.push('');
    for (const s of removed) {
      out.push(`- \`${s.name}\` from \`${s.specifier}\``);
      for (const l of s.locations) out.push(`  - \`${loc(l)}\``);
    }
    out.push('');
  }
  const breaking = r.imports.filter((i) => i.status === 'breaking');
  if (breaking.length > 0) {
    out.push('**Changed, see breaks above**');
    out.push('');
    for (const s of breaking) {
      out.push(`- \`${s.name}\` from \`${s.specifier}\``);
      out.push(`  - before: \`${clip(s.change?.before)}\``);
      out.push(`  - after: \`${clip(s.change?.after)}\``);
    }
    out.push('');
  }
  const changed = r.imports.filter((i) => i.status === 'changed');
  if (changed.length > 0) {
    out.push('<details><summary><b>Changed, still typechecks</b> (' + changed.length + ')</summary>');
    out.push('');
    for (const s of changed) {
      out.push(`- \`${s.name}\` from \`${s.specifier}\``);
      out.push(`  - before: \`${clip(s.change?.before)}\``);
      out.push(`  - after: \`${clip(s.change?.after)}\``);
      for (const l of s.locations) out.push(`  - \`${loc(l)}\``);
    }
    out.push('');
    out.push('</details>');
    out.push('');
  }
  const unknown = r.imports.filter((i) => i.status === 'unknown');
  if (unknown.length > 0 || r.unanalyzed.length > 0) {
    out.push('<details><summary><b>Could not be checked</b></summary>');
    out.push('');
    for (const s of unknown) {
      out.push(`- \`${s.name}\` from \`${s.specifier}\``);
      for (const l of s.locations) out.push(`  - \`${loc(l)}\``);
    }
    for (const u of r.unanalyzed) {
      out.push(`- ${u.reason}`);
      for (const l of u.locations) out.push(`  - \`${loc(l)}\``);
    }
    out.push('');
    out.push('</details>');
    out.push('');
  }
  out.push(
    `<sub>Checked ${r.files.length} file${r.files.length === 1 ? '' : 's'} with TypeScript ${r.meta.typescript}. ` +
      `Facts only: declarations of both versions against this repo's source. Runtime behavior is not checked.</sub>`,
  );
  return out.join('\n');
}
