import { Details } from './helpers';

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
  taskNotFound: { code: 'TK-A-0001', details: Details.Define<{ taskId: number }>() },

  // Domain
  taskInvariantFailed: {
    code: 'TK-D-0000',
    details: Details.Define<{ message: string; field: string }>(),
  },

  // Infrastructure
  taskDBFailed: { code: 'TK-I-0000' },
  taskCreationFailed: { code: 'TK-I-0001' },
} as const satisfies ExceptionConfig;

const exceptionCode = {
  ...tasks,
  ...account,
} as const satisfies ExceptionConfig;

export { exceptionCode };
