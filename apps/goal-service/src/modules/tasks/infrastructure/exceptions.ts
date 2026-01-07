import {
  defineExceptionState,
  exceptionCode,
  generateBaseExceptionsGuards,
  generateExceptionClasses,
} from '@big-d/exceptions';

const InfrastructureExceptionStateList = {
  TaskInfrastructure: defineExceptionState({
    key: 'TASK_INFRASTRUCTURE_ERROR',
    code: exceptionCode.taskDBFailed.code,
    details: exceptionCode.taskDBFailed.details,
  }),
};

export const { ExceptionTaskInfrastructure } = generateExceptionClasses(
  InfrastructureExceptionStateList,
);

export const { isExceptionTaskInfrastructure } = generateBaseExceptionsGuards([
  ['isExceptionTaskInfrastructure', ExceptionTaskInfrastructure],
]);
