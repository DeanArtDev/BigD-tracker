import { buildLink } from './helpers';
import type { UrlQueryParams } from './types';

const routes = {
  home: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/'),

  signUp: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/sign-up'),

  login: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/login'),

  error: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/error'),
} as const;

export { routes };
