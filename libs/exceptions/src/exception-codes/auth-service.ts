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

const auth = {
  // Application
  authInvalidTokenFormat: {
    code: 'ASA-A-0001',
    details: Details.Define<{ message: string; subjectId?: number | string }>(),
  },
} as const satisfies ExceptionConfig;

const sessions = {
  // Application
  sessionNotFound: { code: 'ASS-A-0001', details: Details.Define<{ sessionId?: number; userId?: string | number }>() },

  sessionInvalid: {
    code: 'ASS-A-0002',
    details: Details.Define<{ message: string; sessionId?: number; userId: number }>(),
  },
} as const satisfies ExceptionConfig;

const users = {
  // Application
  userNotFound: { code: 'ASU-A-0001', details: Details.Define<{ userId?: string | number }>() },
  userNotExist: { code: 'ASU-A-0002', details: Details.Define<{ userId?: string | number }>() },
  userAlreadyExist: { code: 'ASU-A-0003', details: Details.Define<{ userId?: string | number; email?: string }>() },
  userWrongLoginOrPassword: {
    code: 'ASU-A-0004',
    details: Details.Define<{ message: string }>(),
  },
} as const satisfies ExceptionConfig;

const authService = { ...auth, ...sessions, ...users, ...system };

export { authService };
