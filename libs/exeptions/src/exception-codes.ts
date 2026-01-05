import { Details } from './helpers';
import { ValidationIssue } from './types';

interface ExceptionConfig {
  [key: string]: {
    readonly code: string;
    readonly details?: Record<string, unknown>;
  };
}

// Account service
const account = {
  // Application
  accountUnauthorized: {
    code: 'AC-A-0001',
    details: Details.Define<{ message: string }>(),
  },

  accountWrongLoginOrPassword: {
    code: 'AC-A-0002',
    details: Details.Define<{ message: string }>(),
  },
} as const satisfies ExceptionConfig;

// Goal service
const tasks = {
  // Application
  taskNotFound: { code: 'GT-A-0001', details: Details.Define<{ taskId?: number }>() },

  // Domain
  taskInvariantFailed: {
    code: 'GT-D-0000',
    details: Details.Define<{ message: string; field: string }>(),
  },

  // Infrastructure
  taskDBFailed: { code: 'GT-I-0000' },
  taskCreationFailed: { code: 'GT-I-0001' },
} as const satisfies ExceptionConfig;

const groupt = {
  // Application
  groupNotExists: { code: 'GG-A-0001', details: Details.Define<{ groupId?: number }>() },
} as const satisfies ExceptionConfig;

// SYSTEM
const system = {
  // Application
  invalidRpcResponse: {
    code: 'S-GW-0001',
    details: Details.Define<{ issues: ValidationIssue[] }>(),
  },

  requestDateValidation: {
    code: 'S-GW-0002',
    details: Details.Define<{ message: string; issues: ValidationIssue[] }>(),
  },

  requestContextPayload: {
    code: 'S-GW-0003',
    details: Details.Define<{ message: string }>(),
  },
} as const satisfies ExceptionConfig;

const exceptionCode = {
  ...tasks,
  ...groupt,
  ...account,
  ...system,
} as const satisfies ExceptionConfig;

export { exceptionCode };
