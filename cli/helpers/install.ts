/* eslint-disable no-console */
import { exec } from 'node:child_process';

import chalk from 'chalk';

const { red } = chalk;

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

const INSTALL_COMMANDS: Record<PackageManager, string> = {
  npm: 'npm install',
  pnpm: 'pnpm install',
  yarn: 'yarn install',
  bun: 'bun install',
};

interface InstallOptions {
  cwd?: string;
}

const install = async (packageManager: PackageManager = 'npm', options: InstallOptions = {}) => {
  const installCommand = INSTALL_COMMANDS[packageManager] ?? INSTALL_COMMANDS.npm;

  return new Promise((resolve, reject) => {
    exec(installCommand, { cwd: options.cwd }, (error, stdout) => {
      if (error) {
        reject(error);

        console.log(`${red(error)}`);

        return;
      }

      console.log(stdout);

      resolve(stdout);
    });
  });
};

export { install, PackageManager };
