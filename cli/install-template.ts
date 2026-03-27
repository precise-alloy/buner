/* eslint-disable no-console */
import type { PackageManager } from './helpers/install.js';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

import chalk from 'chalk';

import packageJson_ from '../package.json';

import { copy } from './helpers/copy.js';
import { install } from './helpers/install.js';
import { formatFiles } from './helpers/format-files.js';

export const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(filename);

interface Props {
  appName: string;
  root: string;
  packageManager: PackageManager;
}

const { cyan } = chalk;

const installTemplate = async (model: Props) => {
  const { appName, root, packageManager } = model;

  console.log('\nInitializing project');
  const copySource = ['**'];

  await copy(copySource, root, {
    cwd: path.join(dirname, '..'),
  });

  await formatFiles(root);

  const packageJson = {
    name: appName,
    description: '',
    version: '0.1.0',
    type: 'module',
    private: true,
    scripts: {
      start: 'buner dev',
      dev: 'buner dev',
      serve: 'buner serve',
      build: 'buner build',
      generate: 'buner generate',
      eshn: 'buner eshn',
      inte: 'buner inte',
      styles: 'buner styles',
      prerender: 'buner prerender',
    },
    dependencies: {
      buner: `^${packageJson_.version}`,
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'react-router-dom': '^7.0.0',
    },
  };

  await fs.writeFile(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL);

  console.log('\nInstalling dependencies:');

  for (const dependency in packageJson.dependencies) {
    console.log(`- ${cyan(dependency)}`);
  }

  await install(packageManager, { cwd: root });
};

export { installTemplate };
