import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { analyzeNpm, LocalProvider, type Report } from '../src/index.js';

export const fixtures = path.resolve(__dirname, 'fixtures');

export async function analyzeFixture(from: string, to: string, pkg = 'demo-lib'): Promise<Report> {
  const work = await mkdtemp(path.join(tmpdir(), 'bumpcheck-test-'));
  const provider = new LocalProvider(
    {
      'demo-lib@1.0.0': path.join(fixtures, 'demo-lib-v1'),
      'demo-lib@2.0.0': path.join(fixtures, 'demo-lib-v2'),
      'demo-ambient@1.0.0': path.join(fixtures, 'demo-ambient-v1'),
      'demo-ambient@2.0.0': path.join(fixtures, 'demo-ambient-v2'),
    },
    work,
  );
  return analyzeNpm({ repoRoot: path.join(fixtures, 'consumer'), pkg, from, to, provider });
}
