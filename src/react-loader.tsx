import { lazy } from 'react';

export const blocks: { [name: string]: any } = {
  root: lazy(() => import('../xpack/root')),
  people: lazy(() => import('./organisms/people')),
  header: lazy(() => import('./organisms/header')),
};
