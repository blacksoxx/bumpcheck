/** Prints the fixture report's break list and summary; handy when updating test expectations. */
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { analyzeNpm, LocalProvider } from '../src/index.js';

const fixtures = path.resolve('test/fixtures');
const work = await mkdtemp(path.join(tmpdir(), 'bumpcheck-print-'));
const provider = new LocalProvider(
  { 'demo-lib@1.0.0': path.join(fixtures, 'demo-lib-v1'), 'demo-lib@2.0.0': path.join(fixtures, 'demo-lib-v2') },
  work,
);
const r = await analyzeNpm({ repoRoot: path.join(fixtures, 'consumer'), pkg: 'demo-lib', from: '1.0.0', to: '2.0.0', provider });
for (const b of r.breaks) console.log(JSON.stringify([b.kind, b.symbol, `${b.location.file}:${b.location.line}`, b.attribution]));
console.log(JSON.stringify(r.summary));
for (const i of r.imports) console.log(i.name, i.specifier, i.status);
