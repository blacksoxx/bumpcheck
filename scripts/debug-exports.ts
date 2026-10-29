/** Prints how a specifier resolves and what it exports in two versions. Debug aid. */
import path from 'node:path';
import { NpmProvider } from '../src/index.js';
import { buildProgram, loadRepoConfig } from '../src/npm/program.js';
import { getModuleExports } from '../src/npm/exports.js';

const [repo, pkg, ...versions] = process.argv.slice(2);
if (!repo || !pkg || versions.length === 0) throw new Error('usage: debug-exports <repo> <pkg> <version...>');
const root = path.resolve(repo);
const cfg = loadRepoConfig(root);
console.log('config:', cfg.source, 'moduleResolution:', cfg.options.moduleResolution, 'module:', cfg.options.module);
const provider = new NpmProvider();
for (const v of versions) {
  const built = buildProgram(root, cfg, { pkg, overlay: await provider.ensure(pkg, v) });
  const r = built.resolveTarget(pkg).resolvedModule;
  const ex = getModuleExports(built, pkg);
  const names = [...ex.exports.keys()];
  console.log(`${pkg}@${v}: ${r?.resolvedFileName.split('node_modules/').pop()} typed=${ex.typed} exports=${names.length} default=${ex.exports.has('default')} sample=${names.slice(0, 6).join(',')}`);
}
