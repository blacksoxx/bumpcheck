#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { writeFile } from 'node:fs/promises';
import { analyzeNpm } from './npm/analyze.js';
import { NpmProvider } from './registry/provider.js';
import { renderMarkdown, renderText } from './report/render.js';

const HELP = `bumpcheck — prove whether a dependency bump breaks the code that imports it

Usage
  bumpcheck <package> <from> <to> [options]

Options
  --repo <dir>        Repository to analyze (default: current directory)
  --format <fmt>      text | markdown | json (default: text)
  --json-out <file>   Also write the full JSON report to a file
  --cache-dir <dir>   Where package versions are cached
  --registry <url>    npm registry (default: npm config / BUMPCHECK_REGISTRY)
  --no-fail           Exit 0 even when breaks are found
  -h, --help          Show this help

Exit codes
  0  no breaks found
  1  at least one break found
  2  usage or analysis error

Example
  bumpcheck axios 1.6.8 1.7.2 --repo ./my-app --format markdown
`;

async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      repo: { type: 'string' },
      format: { type: 'string', default: 'text' },
      'json-out': { type: 'string' },
      'cache-dir': { type: 'string' },
      registry: { type: 'string' },
      fail: { type: 'boolean', default: true },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  if (values.help || positionals.length !== 3) {
    process.stdout.write(HELP);
    return values.help ? 0 : 2;
  }
  const [pkg, from, to] = positionals as [string, string, string];
  const format = values.format;
  if (format !== 'text' && format !== 'markdown' && format !== 'json') {
    process.stderr.write(`Unknown format "${format}". Use text, markdown, or json.\n`);
    return 2;
  }

  const providerOpts: { cacheDir?: string; registry?: string } = {};
  if (values['cache-dir']) providerOpts.cacheDir = values['cache-dir'];
  if (values.registry) providerOpts.registry = values.registry;

  const report = await analyzeNpm({
    repoRoot: values.repo ?? process.cwd(),
    pkg,
    from,
    to,
    provider: new NpmProvider(providerOpts),
  });

  const body =
    format === 'json' ? JSON.stringify(report, null, 2) : format === 'markdown' ? renderMarkdown(report) : renderText(report);
  process.stdout.write(body + '\n');
  if (values['json-out']) await writeFile(values['json-out'], JSON.stringify(report, null, 2) + '\n');

  return report.breaks.length > 0 && values.fail ? 1 : 0;
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err: unknown) => {
    process.stderr.write(`bumpcheck: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(2);
  },
);
