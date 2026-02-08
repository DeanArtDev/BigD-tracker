import { type components } from './generated-types';
import { type paths } from './generated-types';

export * from './query-types';
export type ApiDto = components['schemas'];
export type ApiEndpoints = paths;
