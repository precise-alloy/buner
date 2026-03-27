/* eslint-disable no-console */

import { loadEnv } from 'vite';

import { startServer } from './xpack/create-server.js';

export interface ServerOptions {
  mode?: string;
}

export const runServer = (options: ServerOptions = {}) => {
  const mode = options.mode ?? 'production';

  console.log('[INIT] server');

  const root = process.cwd();
  const xpackEnv = loadEnv(mode, root);
  const isTest = !!xpackEnv.VITE_TEST_BUILD || process.env.NODE_ENV === 'test';
  const port = xpackEnv.VITE_PORT ? parseInt(xpackEnv.VITE_PORT) : 5000;

  if (!isTest) {
    console.log(root);
    startServer({
      root,
      isTest,
      port,
      hmrPort: port + 1,
      baseUrl: xpackEnv.VITE_BASE_URL,
    });
  }
};

// Direct execution support
const isDirectRun = process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('server.ts');

if (isDirectRun) {
  const argvModeIndex = process.argv.indexOf('--mode');
  const mode =
    argvModeIndex >= 0 && argvModeIndex < process.argv.length - 1 && !process.argv[argvModeIndex + 1].startsWith('-')
      ? process.argv[argvModeIndex + 1]
      : 'production';

  runServer({ mode });
}
