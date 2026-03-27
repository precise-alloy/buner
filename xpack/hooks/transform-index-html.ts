import { PluginOption } from 'vite';

import { packageRoot } from '../paths';

const transformIndexHtml = (baseUrl: string): PluginOption => {
  // console.log('[INIT] transformIndexHtml');

  return {
    name: 'xpack-transform-index-html',
    enforce: 'pre',

    transformIndexHtml(html) {
      // console.log('transformIndexHtml');

      return html.replaceAll('#__BASE_URL__/', baseUrl).replaceAll('@xpack/', `${packageRoot}/xpack/`);
    },
  };
};

export default transformIndexHtml;
