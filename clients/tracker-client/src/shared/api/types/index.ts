import type { StripApiRoutes } from './type-helpers';
import { type components, type operations } from './generated-types';
import { type paths } from './generated-types';

export * from './query-types';
export type ApiSchemas = components['schemas'];
export type ApiEndpoints = operations;
export type ApiPaths = StripApiRoutes<paths>;
