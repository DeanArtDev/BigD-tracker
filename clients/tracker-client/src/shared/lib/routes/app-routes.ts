import { buildLink } from './helpers';
import type { UrlQueryParams } from './types';

const routes = {
  home: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/'),

  /* GYM */
  gym: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/gym'),

  gymActiveTraining: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/gym/active'),

  gymDashboard: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/gym/dashboard'),

  gymTrainings: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/gym/trainings'),

  gymExercises: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/gym/exercises'),

  gymPrograms: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/gym/programs'),

  /* PLANNER */

  planner: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/planner'),

  plannerInBox: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/planner/inbox'),

  /* SYSTEM */
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
