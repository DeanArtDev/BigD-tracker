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

  plannerGroupList: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/planner/groups'),

  plannerGroup: (<Path extends string = string>(path: Path) => ({
    path,
    link: ({ groupId }: { groupId: number }, query?: UrlQueryParams) =>
      buildLink(path, { urlParams: { groupId: groupId.toString() }, queryObject: query }),
  }))('/planner/groups/:groupId'),

  plannerDiary: (<Path extends string = string>(path: Path) => ({
    path,
    link: () => buildLink(path),
  }))('/planner/diary'),

  plannerTasks: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/planner/tasks'),

  /* SYSTEM */
  signUp: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/sign-up'),

  login: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/login'),

  settings: (<Path extends string = string>(path: Path) => ({
    path,
    link: () => buildLink(path),
  }))('/settings'),

  error: (<Path extends string = string>(path: Path) => ({
    path,
    link: (query?: UrlQueryParams) => buildLink(path, { queryObject: query }),
  }))('/error'),
} as const;

const apiRoutes = {
  dropSession: (<Path extends string = string>(path: Path) => ({
    path,
    link: () => buildLink(path),
  }))('/api/auth/drop-session'),
};

type RoutePaths = (typeof routes)[keyof typeof routes]['path'];
type ApiRoutePaths = (typeof apiRoutes)[keyof typeof apiRoutes]['path'];

export { routes, apiRoutes, type RoutePaths, type ApiRoutePaths };
