import path from 'path';
import { fileURLToPath } from 'url';

import slash from 'slash';
import { loadEnv } from 'vite';

const argvModeIndex = process.argv.indexOf('--mode');
const mode =
  process.env.BUNER_MODE ??
  (argvModeIndex >= 0 && argvModeIndex < process.argv.length - 1 && !process.argv[argvModeIndex + 1].startsWith('-')
    ? process.argv[argvModeIndex + 1]
    : 'production');

// Consumer project root — where buner commands are run
export const root = slash(process.cwd());

// Package install location — where buner's own files live
export const packageRoot = slash(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));

export const xpackEnv = loadEnv(mode, root);

export const srcRoot = slash(path.resolve(root, 'src'));
export const typesRoot = slash(path.resolve(srcRoot, '_types'));
export const viteSharedRoot = slash(path.resolve(root, 'xpack/shared'));
export const outDir = slash(path.resolve(root, 'dist'));

export const getAbsolutePath = (p: string) => {
  return path.isAbsolute(p) ? slash(p) : slash(path.resolve(root, p));
};

export { mode };
