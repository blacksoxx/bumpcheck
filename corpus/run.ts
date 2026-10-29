/**
 * Runs bumpcheck over real-world bumps and writes corpus/results.md.
 *
 *   npx tsx corpus/run.ts              # all cases
 *   npx tsx corpus/run.ts zod          # cases whose id contains "zod"
 *   npx tsx corpus/run.ts --oracle     # also install the new version and run tsc
 *
 * Each case pins a public repo at the commit just before a real Dependabot or
 * Renovate merge, so the result is reproducible. The oracle mode installs the
 * new version into the checkout and runs the repo's own type checker; its
 * error count is the ground truth bumpcheck should agree with.
 */
import { spawn } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { analyzeNpm, NpmProvider, renderText, type Report } from '../src/index.js';

interface Case {
  id: string;
  repo: string;
  /** Commit the pull request was based on. */
  base: string;
  /** Sub-directory containing package.json, when not the repo root. */
  dir?: string;
  pkg: string;
  from: string;
  to: string;
  pr?: string;
  /** What the pull request actually needed, written by a human after reading it. */
  truth: string;
}

const here = path.dirname(new URL(import.meta.url).pathname);
const checkouts = path.join(homedir(), '.cache', 'bumpcheck', 'corpus');

function sh(cmd: string, args: string[], cwd: string): Promise<{ code: number; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (d: Buffer) => (out += d.toString()));
    child.stderr.on('data', (d: Buffer) => (out += d.toString()));
    child.on('close', (code) => resolve({ code: code ?? 1, out }));
  });
}

async function exists(p: string): Promise<boolean> {
  return stat(p).then(() => true, () => false);
}

async function checkout(c: Case): Promise<string> {
  const dir = path.join(checkouts, c.repo.replace('/', '__'), c.base.slice(0, 12));
  if (!(await exists(path.join(dir, '.git')))) {
    await mkdir(path.dirname(dir), { recursive: true });
    const clone = await sh('git', ['clone', '-q', '--filter=blob:none', `https://github.com/${c.repo}.git`, dir], checkouts);
    if (clone.code !== 0) throw new Error(clone.out);
    const co = await sh('git', ['checkout', '-q', c.base], dir);
    if (co.code !== 0) throw new Error(co.out);
  }
  const root = c.dir ? path.join(dir, c.dir) : dir;
  // Analyze the way CI would: with the repo's own dependencies installed.
  if (!(await exists(path.join(root, 'node_modules')))) {
    const base = ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--loglevel=error'];
    let r = await sh('npm', base, root);
    if (r.code !== 0) r = await sh('npm', [...base, '--legacy-peer-deps'], root);
    if (r.code !== 0) process.stderr.write(`  (dependency install failed for ${c.id}; analyzing without node_modules)\n`);
  }
  return root;
}

/**
 * Ground truth: the repo's own type checker. Install the base lockfile, run
 * tsc, install the new version, run tsc again. Errors present only after the
 * bump are what bumpcheck should have found.
 */
async function oracle(repoRoot: string, c: Case): Promise<string> {
  const npmInstall = async (extra: string[]) => {
    const base = ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--loglevel=error', ...extra];
    let r = await sh('npm', base, repoRoot);
    if (r.code !== 0) r = await sh('npm', [...base, '--legacy-peer-deps'], repoRoot);
    return r;
  };
  const tscErrors = async (): Promise<Set<string>> => {
    const r = await sh('npx', ['tsc', '--noEmit', '-p', '.'], repoRoot);
    return new Set(r.out.split('\n').filter((l) => /error TS\d+/.test(l)));
  };
  const first = await npmInstall([]);
  if (first.code !== 0) return `install failed: ${first.out.trim().split('\n').pop()}`;
  const before = await tscErrors();
  const second = await npmInstall([`${c.pkg}@${c.to}`]);
  if (second.code !== 0) return `install of ${c.pkg}@${c.to} failed`;
  const after = await tscErrors();
  await sh('git', ['checkout', '-q', '--', '.'], repoRoot);
  const fresh = [...after].filter((l) => !before.has(l)).sort();
  await writeFile(path.join(checkouts, `${c.id}.oracle.txt`), fresh.join('\n') + '\n');
  return `tsc: ${fresh.length} new errors (${before.size} before, ${after.size} after)`;
}

/** A previous --oracle run leaves its error list behind; reuse it. */
async function cachedOracle(c: Case): Promise<string> {
  const file = path.join(checkouts, `${c.id}.oracle.txt`);
  if (!(await exists(file))) return 'not run';
  const lines = (await readFile(file, 'utf8')).split('\n').filter(Boolean);
  return `tsc: ${lines.length} new errors (cached)`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const useOracle = args.includes('--oracle');
  const filter = args.filter((a) => !a.startsWith('--'))[0];
  const cases = JSON.parse(await readFile(path.join(here, 'cases.json'), 'utf8')) as Case[];
  const provider = new NpmProvider();
  const rows: string[] = [];
  const details: string[] = [];

  for (const c of cases) {
    if (filter && !c.id.includes(filter)) continue;
    process.stderr.write(`→ ${c.id}\n`);
    let report: Report | undefined;
    let error: string | undefined;
    let repoRoot = '';
    try {
      repoRoot = await checkout(c);
      report = await analyzeNpm({ repoRoot, pkg: c.pkg, from: c.from, to: c.to, provider });
    } catch (e) {
      error = e instanceof Error ? e.message.split('\n')[0] : String(e);
    }
    const verdict = useOracle && repoRoot ? await oracle(repoRoot, c) : await cachedOracle(c);
    if (report) {
      const s = report.summary;
      rows.push(`| ${c.id} | ${c.pkg} ${c.from} → ${c.to} | ${s.importedSymbols} | ${s.breaks} | ${s.removed + s.breaking} | ${s.changed} | ${s.unknown} | ${report.meta.durationMs} | ${c.truth} | ${verdict} |`);
      details.push(`### ${c.id}\n\n${c.pr ? `PR: ${c.pr}\n\n` : ''}\`\`\`\n${renderText(report)}\n\`\`\`\n`);
      await writeFile(
        path.join(checkouts, `${c.id}.bumpcheck.txt`),
        report.breaks.map((b) => `${b.location.file}(${b.location.line},${b.location.column}): TS${b.code}`).sort().join('\n') + '\n',
      );
    } else {
      rows.push(`| ${c.id} | ${c.pkg} ${c.from} → ${c.to} | | | | | | | ${c.truth} | error: ${error} |`);
    }
  }

  const md = [
    '# Corpus results',
    '',
    `Generated ${new Date().toISOString().slice(0, 10)} with \`npx tsx corpus/run.ts${useOracle ? ' --oracle' : ''}\`.`,
    '',
    'Columns: what bumpcheck reported, what the pull request actually did, and the tsc oracle',
    '(new type errors after installing the new version, which includes implicit-any cascades that bumpcheck folds into their root cause).',
    '',
    '| case | bump | imports | breaks | symbols broken | changed ok | unknown | ms | pull request | tsc oracle |',
    '|---|---|---|---|---|---|---|---|---|---|',
    ...rows,
    '',
    ...details,
  ].join('\n');
  // A filtered run is for investigation; only a full run updates results.md.
  if (!filter) await writeFile(path.join(here, 'results.md'), md);
  process.stdout.write(md + '\n');
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
