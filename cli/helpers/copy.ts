import path from 'path';
import fs from 'fs/promises';

import { globby } from 'globby';

interface CopyOption {
  cwd: string;
}

const excludeFiles = [
  'dist',
  '.git',
  '.github',
  '.npmrc',
  'bin',
  'cli',
  'xpack',
  '.vscode',
  '.build',
  'node_modules',
  'server.ts',
  'prerender.ts',
  'integration.ts',
  'styles.ts',
  'scripts.ts',
  'states.ts',
  'migrate-scss.ts',
  'vite.config.ts',
  'vite.cli.config.ts',
  'src',
  'public/samples',
  'public/assets/vendors',
];

const copy = async (src: string | string[], dest: string, { cwd }: CopyOption) => {
  const sourceFiles = await globby(src, {
    cwd,
    dot: true,
    absolute: false,
    gitignore: true,
    ignore: excludeFiles,
  });

  const destRelativeToCwd = path.resolve(dest);

  return Promise.all(
    sourceFiles.map(async (p) => {
      const dirname = path.dirname(p);
      const basename = path.basename(p);

      const from = path.resolve(cwd, p);
      const filePath = path.join(destRelativeToCwd, dirname, basename);

      // Ensure the destination directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      return fs.copyFile(from, filePath);
    })
  );
};

export { copy };
