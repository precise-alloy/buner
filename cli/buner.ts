/* eslint-disable no-console */

import path from 'path';
import { execSync, spawn, SpawnOptions } from 'child_process';

import { Command } from 'commander';
import chalk from 'chalk';
import fetch from 'node-fetch';
import prompts from 'prompts';

import packageJson from '../package.json';

import { createApp } from './create-app.js';
import { validateNpmName } from './helpers/validate-pkg.js';

const { green, yellow, bold, cyan, red } = chalk;
const packageName = 'buner';

const run = (cmd: string, args: string[] = [], options: SpawnOptions = {}) => {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
      ...options,
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command "${cmd} ${args.join(' ')}" exited with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', reject);
  });
};

const runSync = (cmd: string) => {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
};

const onPromptState = (state: { value?: string; aborted?: boolean }) => {
  if (state?.aborted) {
    process.stdout.write('\x1B[?25h');
    process.stdout.write('\n');
    process.exit(1);
  }
};

const parseVersion = (version: string): number => {
  return parseInt(version.replaceAll('.', ''));
};

const update = fetch(`https://registry.npmjs.org/${packageJson.name}/latest`)
  .then((res) => res.json())
  .catch(() => null);

async function notifyUpdate(): Promise<void> {
  try {
    const data = (await update) as { version: string };

    if (data.version && parseVersion(data.version) !== parseVersion(packageJson.version)) {
      const updateMessage = `npm update -g ${packageName}`;

      console.log(
        yellow(bold(`A new version of '${packageName}' is available!`)) + '\n' + 'You can update by running: ' + cyan(updateMessage) + '\n'
      );
    }
  } catch {
    // ignore error
  }
}

const program = new Command();

program.name(packageName).description('Frontend build toolkit for Vite + React SSR projects').version(packageJson.version);

// buner create [dir]
program
  .command('create')
  .argument('[project-directory]', 'the project name', '')
  .description('Scaffold a new frontend project')
  .action(async (projectPath: string) => {
    if (!projectPath) {
      const validation = validateNpmName('my-app');

      const res = await prompts({
        onState: onPromptState,
        type: 'text',
        name: 'path',
        message: 'What is your project named?',
        initial: 'my-app',
        validate: (name) => {
          const validation = validateNpmName(path.basename(path.resolve(name)));

          if (validation.valid) {
            return true;
          }

          return `Invalid project name ${validation?.problems?.[0] ? validation?.problems?.[0] : ''}`;
        },
      });

      if (typeof res.path === 'string') {
        projectPath = res.path.trim();
      }
    }

    if (!projectPath) {
      console.log(
        '\nPlease specify the project directory:\n' +
          `  ${cyan('buner create')} ${green('<project-directory>')}\n` +
          'For example:\n' +
          `  ${cyan('buner create')} ${green('my-app')}\n`
      );
      process.exit(1);
    }

    const resolvedProjectPath = path.resolve(projectPath);

    await createApp({ appPath: resolvedProjectPath });
    await notifyUpdate();
  });

// buner dev
program
  .command('dev')
  .description('Start development mode with all watchers')
  .action(async () => {
    await run('npx', [
      'concurrently',
      '--kill-others',
      '"bun styles.ts --watch"',
      '"bun states.ts --watch"',
      '"cross-env scriptOnly=true npx vite build --mode development --watch"',
      '"bun server.ts --mode development"',
    ]);
  });

// buner serve
program
  .command('serve')
  .description('Start the SSR dev server')
  .option('--mode <mode>', 'server mode', 'development')
  .action(async (opts) => {
    await run('bun', ['server.ts', '--mode', opts.mode]);
  });

// buner build
program
  .command('build')
  .description('Build the project (static + SSR)')
  .action(async () => {
    runSync('npx vite build --outDir dist/static');
    runSync('npx vite build --ssr src/entry-server.tsx --outDir dist/server');
  });

// buner generate
program
  .command('generate')
  .description('Full static site generation (states + styles + build + prerender)')
  .option('--mode <mode>', 'build mode', 'production')
  .action(async (opts) => {
    runSync('bun states.ts');
    runSync('bun styles.ts');
    if (opts.mode === 'production') {
      runSync('npx vite build --outDir dist/static');
      runSync('npx vite build --ssr src/entry-server.tsx --outDir dist/server');
    } else {
      runSync(`npx vite build --outDir dist/static --mode ${opts.mode}`);
      runSync(`npx vite build --ssr src/entry-server.tsx --outDir dist/server --mode ${opts.mode}`);
    }
    runSync(`bun prerender.ts --add-hash --mode ${opts.mode}`);
  });

// buner eshn
program
  .command('eshn')
  .description('Generate with --mode eshn')
  .action(async () => {
    runSync('bun states.ts');
    runSync('bun styles.ts');
    runSync('npx vite build --outDir dist/static --mode eshn');
    runSync('npx vite build --ssr src/entry-server.tsx --outDir dist/server --mode eshn');
    runSync('bun prerender.ts --add-hash --mode eshn');
  });

// buner inte
program
  .command('inte')
  .description('Build and integrate with backend (styles + build + prerender + integration)')
  .action(async () => {
    runSync('bun styles.ts');
    runSync('npx vite build --outDir dist/static');
    runSync('npx vite build --ssr src/entry-server.tsx --outDir dist/server');
    runSync('bun prerender.ts');
    runSync('bun integration.ts');
  });

// buner styles
program
  .command('styles')
  .description('Compile SCSS')
  .option('--watch', 'Watch for changes')
  .action(async (opts) => {
    const args = ['styles.ts'];

    if (opts.watch) args.push('--watch');
    await run('bun', args);
  });

// buner prerender
program
  .command('prerender')
  .description('Pre-render HTML files')
  .option('--add-hash', 'Add content hashes to asset URLs')
  .option('--mode <mode>', 'build mode', 'production')
  .action(async (opts) => {
    const args = ['prerender.ts'];

    if (opts.addHash) args.push('--add-hash');
    args.push('--mode', opts.mode);
    await run('bun', args);
  });

program.parseAsync(process.argv).catch(async (error) => {
  console.log(red(error));
  await notifyUpdate();
  process.exit(1);
});

export { packageName };
