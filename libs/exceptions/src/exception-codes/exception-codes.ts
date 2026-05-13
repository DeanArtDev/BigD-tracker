import { Details } from '../helpers';
import { authService } from './auth-service';
import { ExceptionConfig, ExtractCodes, ValidationIssue } from './types';

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

  userNotFound: {
    code: 'AC-U-0001',
    details: Details.Define<{ userId: number }>(),
  },

  sessionNotFound: {
    code: 'AC-S-0001',
    details: Details.Define<{ userId: number; message?: string }>(),
  },

  sessionExpired: {
    code: 'AC-S-0002',
    details: Details.Define<{ userId: number; message?: string }>(),
  },
} as const satisfies ExceptionConfig;

// Goal service
const tasks = {
  // Application
  taskNotFound: { code: 'GT-A-0001', details: Details.Define<{ taskId?: string | number }>() },
  taskNotExist: { code: 'GT-A-0002', details: Details.Define<{ taskId?: string | number }>() },
  taskNotInGroup: {
    code: 'GT-A-0003',
    details: Details.Define<{ taskId: string | number; groupId?: number; message?: string }>(),
  },
  taskAlreadyInGroup: {
    code: 'GT-A-0004',
    details: Details.Define<{ taskId: string | number; groupId: number; message?: string }>(),
  },

  taskUnprocessable: {
    code: 'GT-A-0005',
    details: Details.Define<{ taskId: string | number; message?: string }>(),
  },
  taskRecurrenceNotExist: {
    code: 'GT-A-0006',
    details: Details.Define<{ taskId?: string | number; recurrenceId?: number }>(),
  },
  taskOverrideNotExist: {
    code: 'GT-A-0007',
    details: Details.Define<{ taskId?: string | number; overrideId?: number }>(),
  },

  // Domain
  taskInvariantFailed: {
    code: 'GT-D-0000',
    details: Details.Define<{ message: string; field: string; taskId?: string | number }>(),
  },

  // Infrastructure
  taskDBFailed: { code: 'GT-I-0000', details: Details.Any },
  taskCreationFailed: {
    code: 'GT-I-0001',
    details: Details.Define<{ taskId?: string | number }>(),
  },
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
    details: Details.Define<{ issues: ValidationIssue[]; message?: string }>(),
  },

  requestDataValidation: {
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

  invariantFailed: {
    code: 'S-GW-0006',
    details: Details.Define<{ message: string; field: string; subjectId?: number | string }>(),
  },

  internalGateway: {
    code: 'S-AG-0001',
    details: Details.Define<{ message: string; subjectId?: number | string }>(),
  },
} as const satisfies ExceptionConfig;

const exceptionCode = {
  ...authService,
  ...tasks,
  ...groups,
  ...account,
  ...system,
} as const satisfies ExceptionConfig;

type ExceptionCodes = ExtractCodes<typeof exceptionCode>;

export { exceptionCode, ExceptionCodes, ExceptionConfig };
