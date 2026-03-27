/* eslint-disable no-console */

import type { PackageManager } from './helpers/install.js';

import path from 'path';
import { fileURLToPath } from 'url';

import { Command } from 'commander';
import chalk from 'chalk';
import fetch from 'node-fetch';
import prompts from 'prompts';
import { build } from 'vite';

import packageJson from '../package.json';
import { runStyles } from '../styles.js';
import { runStates } from '../states.js';
import { runServer } from '../server.js';
import { runPrerender } from '../prerender.js';
import { runIntegration } from '../integration.js';

import { validateNpmName } from './helpers/validate-pkg.js';
import { createApp } from './create-app.js';

const { green, yellow, bold, cyan, red } = chalk;
const packageName = 'buner';

// Package's own directory — after compilation, buner.js lives in dist/
// so __dirname equivalent is the dist/ folder itself
const packageDir = path.dirname(fileURLToPath(import.meta.url));

/** Resolve the vite config path */
const viteConfigPath = () => path.resolve(packageDir, '..', 'vite.config.ts');

/** Run vite build with the given options */
const viteBuild = async (opts: { outDir: string; ssr?: string; mode?: string; watch?: boolean }) => {
  // Set BUNER_MODE so xpack/paths.ts picks up the correct mode
  // (it can't read --mode from process.argv when using the build() API)
  const prevMode = process.env.BUNER_MODE;

  if (opts.mode) {
    process.env.BUNER_MODE = opts.mode;
  }

  const config: Record<string, unknown> = {
    configFile: viteConfigPath(),
    build: {
      outDir: opts.outDir,
      ...(opts.ssr ? { ssr: opts.ssr } : {}),
      ...(opts.watch ? { watch: {} } : {}),
    },
  };

  if (opts.mode) {
    config.mode = opts.mode;
  }

  try {
    await build(config);
  } finally {
    if (prevMode === undefined) {
      delete process.env.BUNER_MODE;
    } else {
      process.env.BUNER_MODE = prevMode;
    }
  }
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
    let packageManager: PackageManager = 'npm';

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

    const packageManagerPrompt = await prompts({
      onState: onPromptState,
      type: 'select',
      name: 'packageManager',
      message: 'Which package manager do you want to use?',
      initial: 0,
      choices: [
        { title: 'npm', value: 'npm' },
        { title: 'pnpm', value: 'pnpm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'bun', value: 'bun' },
      ],
    });

    if (packageManagerPrompt.packageManager) {
      packageManager = packageManagerPrompt.packageManager as PackageManager;
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

    await createApp({ appPath: resolvedProjectPath, packageManager });
    await notifyUpdate();
  });

// buner dev
program
  .command('dev')
  .description('Start development mode with all watchers')
  .action(async () => {
    runStyles({ watch: true });
    runStates({ watch: true });
    process.env.scriptOnly = 'true';
    viteBuild({ outDir: 'dist/static', mode: 'development', watch: true });
    runServer({ mode: 'development' });
  });

// buner serve
program
  .command('serve')
  .description('Start the SSR dev server')
  .option('--mode <mode>', 'server mode', 'development')
  .action(async (opts) => {
    runServer({ mode: opts.mode });
  });

// buner build
program
  .command('build')
  .description('Build the project (static + SSR)')
  .action(async () => {
    await viteBuild({ outDir: 'dist/static' });
    await viteBuild({ outDir: 'dist/server', ssr: 'src/entry-server.tsx' });
  });

// buner generate
program
  .command('generate')
  .description('Full static site generation (states + styles + build + prerender)')
  .option('--mode <mode>', 'build mode', 'production')
  .action(async (opts) => {
    runStates();
    runStyles();
    await viteBuild({ outDir: 'dist/static', mode: opts.mode !== 'production' ? opts.mode : undefined });
    await viteBuild({ outDir: 'dist/server', ssr: 'src/entry-server.tsx', mode: opts.mode !== 'production' ? opts.mode : undefined });
    await runPrerender({ addHash: true, mode: opts.mode });
  });

// buner eshn
program
  .command('eshn')
  .description('Generate with --mode eshn')
  .action(async () => {
    runStates();
    runStyles();
    await viteBuild({ outDir: 'dist/static', mode: 'eshn' });
    await viteBuild({ outDir: 'dist/server', ssr: 'src/entry-server.tsx', mode: 'eshn' });
    await runPrerender({ addHash: true, mode: 'eshn' });
  });

// buner inte
program
  .command('inte')
  .description('Build and integrate with backend (styles + build + prerender + integration)')
  .action(async () => {
    runStyles();
    await viteBuild({ outDir: 'dist/static' });
    await viteBuild({ outDir: 'dist/server', ssr: 'src/entry-server.tsx' });
    await runPrerender();
    runIntegration();
  });

// buner styles
program
  .command('styles')
  .description('Compile SCSS')
  .option('--watch', 'Watch for changes')
  .action(async (opts) => {
    runStyles({ watch: opts.watch });
  });

// buner prerender
program
  .command('prerender')
  .description('Pre-render HTML files')
  .option('--add-hash', 'Add content hashes to asset URLs')
  .option('--mode <mode>', 'build mode', 'production')
  .action(async (opts) => {
    await runPrerender({ addHash: opts.addHash, mode: opts.mode });
  });

program.parseAsync(process.argv).catch(async (error) => {
  console.log(red(error));
  await notifyUpdate();
  process.exit(1);
});

export { packageName };
