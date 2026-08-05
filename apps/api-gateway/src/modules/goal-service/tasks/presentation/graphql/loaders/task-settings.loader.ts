import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { AppRmqClient } from '@/infrastructure/rmq-clients';
import { ExceptionTaskSettingsNotFound } from '@/shared/exceptions';
import { GoalGetTaskSettings } from '@big-d/api-contracts';
import * as DataLoader from 'dataloader';
import { TaskSettingsSchema } from '../schemas';

const TASK_SETTINGS_LOADER = Symbol.for('TASK_SETTINGS_LOADER');

type TaskSettingsDataLoader = DataLoader<string, TaskSettingsSchema>;

function getTaskSettingsDataLoader(input: {
  context: AppGraphQLContext;
  goalClient: AppRmqClient;
  userId: number;
}): TaskSettingsDataLoader {
  const currentLoader = input.context.loaders.get(TASK_SETTINGS_LOADER) as TaskSettingsDataLoader | undefined;
  if (currentLoader != null) return currentLoader;

  const loader = new DataLoader<string, TaskSettingsSchema>(async (taskIds) => {
    const { data } = await input.goalClient.send<GoalGetTaskSettings.Response, GoalGetTaskSettings.Request>(
      GoalGetTaskSettings.pattern,
      { data: { userId: input.userId, taskIds: [...taskIds] } },
    );
    const settingsByTaskId = new Map(data.map((settings) => [settings.taskId, settings]));

    return taskIds.map((taskId) => {
      const settings = settingsByTaskId.get(taskId);
      if (settings == null) return new ExceptionTaskSettingsNotFound({ taskId });

      return { icon: settings.icon, isAllDay: settings.isAllDay };
    });
  });

  input.context.loaders.set(TASK_SETTINGS_LOADER, loader);
  return loader;
}

export { getTaskSettingsDataLoader, TaskSettingsDataLoader };
