import { TaskIdBuilder } from '@/modules/tasks/domain';
import { Injectable } from '@nestjs/common';

type GetTaskTypeRes =
  | {
      readonly isVirtual: true;
      readonly isOrigin: false;
      readonly isOverride: false;
      readonly data: { recurrenceId: number; date: string };
    }
  | {
      readonly isOrigin: true;
      readonly isOverride: false;
      readonly isVirtual: false;
      readonly data: { id: number };
    }
  | {
      readonly isOverride: true;
      readonly isOrigin: false;
      readonly isVirtual: false;
      readonly data: { recurrenceId: number; overrideId: number; date: string };
    }
  | {
      readonly isOverride: false;
      readonly isOrigin: false;
      readonly isVirtual: false;
      readonly data: undefined;
    };

@Injectable()
class TaskTypeService {
  getType(input: { taskId: string }): GetTaskTypeRes {
    const idData = TaskIdBuilder.unwrapId(input.taskId);

    if (idData?.origin != null) {
      return {
        isOrigin: true,
        isOverride: false,
        isVirtual: false,
        data: idData.origin,
      };
    }

    if (idData?.virtual != null) {
      return {
        isOrigin: false,
        isOverride: false,
        isVirtual: true,
        data: idData.virtual,
      };
    }

    if (idData?.override != null) {
      return {
        isOverride: true,
        isOrigin: false,
        isVirtual: false,
        data: idData.override,
      };
    }

    return {
      isOrigin: false,
      isOverride: false,
      isVirtual: false,
      data: undefined,
    };
  }
}

export { TaskTypeService };
