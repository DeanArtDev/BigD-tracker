import { Details } from '../helpers';
import { ExceptionConfig } from './types';

const system = {
  // Domain
  authInvariantFailed: {
    code: 'ASS-D-0000',
    details: Details.Define<{ message: string; field: string; subjectId?: number }>(),
  },

  // Infrastructure
  authDBFailed: { code: 'ASS-I-0001', details: Details.Any },
} as const satisfies ExceptionConfig;

const users = {
  // Application
  userNotFound: { code: 'ASU-A-0001', details: Details.Define<{ userId?: string | number }>() },
  userNotExist: { code: 'ASU-A-0002', details: Details.Define<{ userId?: string | number }>() },
  userAlreadyExist: { code: 'ASU-A-0003', details: Details.Define<{ userId?: string | number; email?: string }>() },
} as const satisfies ExceptionConfig;

const authService = { ...users, ...system };

export { authService };
