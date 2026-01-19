import { Details } from './helpers';
import { ExtractCodes, ValidationIssue } from './types';

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
  taskNotExist: { code: 'GT-A-0002', details: Details.Define<{ taskId?: number }>() },
  taskNotInGroup: {
    code: 'GT-A-0003',
    details: Details.Define<{ taskId: number; groupId?: number; message?: string }>(),
  },
  taskAlreadyInGroup: {
    code: 'GT-A-0004',
    details: Details.Define<{ taskId: number; groupId: number; message?: string }>(),
  },

  // Domain
  taskInvariantFailed: {
    code: 'GT-D-0000',
    details: Details.Define<{ message: string; field: string }>(),
  },

  // Infrastructure
  taskDBFailed: { code: 'GT-I-0000', details: Details.Any },
  taskCreationFailed: { code: 'GT-I-0001' },
} as const satisfies ExceptionConfig;

const groups = {
  // Application
  groupNotExist: { code: 'GG-A-0001', details: Details.Define<{ groupId?: number }>() },
  inboxNotExist: { code: 'GG-A-0002', details: Details.Empty },
  inboxAlreadyExist: { code: 'GG-A-0003', details: Details.Empty },
  groupNotFound: { code: 'GG-A-0004', details: Details.Define<{ groupId?: number }>() },
} as const satisfies ExceptionConfig;

// SYSTEM
const system = {
  requestTimeout: {
    code: 'S-GW-0001',
    details: Details.Define<{ message?: string }>(),
  },

  invalidRpcResponse: {
    code: 'S-GW-0002',
    details: Details.Define<{ issues: ValidationIssue[] }>(),
  },

  requestDateValidation: {
    code: 'S-GW-0003',
    details: Details.Define<{ message: string; issues: ValidationIssue[] }>(),
  },

  requestContextPayload: {
    code: 'S-GW-0003',
    details: Details.Define<{ message: string }>(),
  },

  serviceUnavailable: {
    code: 'S-GW-0004',
    details: Details.Define<{ message?: string }>(),
  },

  writeConflict: {
    code: 'S-GW-0005',
    details: Details.Define<{ subjectId: number; message?: string }>(),
  },
} as const satisfies ExceptionConfig;

const exceptionCode = {
  ...tasks,
  ...groups,
  ...account,
  ...system,
} as const satisfies ExceptionConfig;

type ExceptionCodes = ExtractCodes<typeof exceptionCode>;

export { exceptionCode, ExceptionCodes };
