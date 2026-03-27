import path from 'path';

import { srcRoot, packageRoot } from './paths';

const alias = [
  { find: '@src', replacement: srcRoot },
  { find: '@atoms', replacement: path.resolve(srcRoot, 'atoms') },
  { find: '@molecules', replacement: path.resolve(srcRoot, 'molecules') },
  { find: '@organisms', replacement: path.resolve(srcRoot, 'organisms') },
  { find: '@templates', replacement: path.resolve(srcRoot, 'templates') },
  { find: '@pages', replacement: path.resolve(srcRoot, 'pages') },
  { find: '@assets', replacement: path.resolve(srcRoot, 'assets') },
  { find: '@helpers', replacement: path.resolve(srcRoot, '_helpers') },
  { find: '@data', replacement: path.resolve(srcRoot, '_data') },
  { find: '@_types', replacement: path.resolve(srcRoot, '_types') },
  { find: '@_http', replacement: path.resolve(srcRoot, '_http') },
  { find: '@_api', replacement: path.resolve(srcRoot, '_api') },
  { find: '@mocks', replacement: path.resolve(srcRoot, 'mocks') },
  { find: '@xpack', replacement: path.resolve(packageRoot, 'xpack') },
];

export default alias;
