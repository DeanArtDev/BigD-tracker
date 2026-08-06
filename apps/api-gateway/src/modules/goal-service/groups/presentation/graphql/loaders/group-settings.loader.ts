import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { AppRmqClient } from '@/infrastructure/rmq-clients';
import { ExceptionGroupSettingsNotFound } from '@/shared/exceptions';
import { GoalGetManyGroupSettings } from '@big-d/api-contracts';
import * as DataLoader from 'dataloader';
import { GroupSettingsSchema } from '../schemas';

const GROUP_SETTINGS_LOADER = Symbol.for('GROUP_SETTINGS_LOADER');

type GroupSettingsDataLoader = DataLoader<number, GroupSettingsSchema>;

function getGroupSettingsDataLoader(input: {
  context: AppGraphQLContext;
  goalClient: AppRmqClient;
  userId: number;
}): GroupSettingsDataLoader {
  const currentLoader = input.context.loaders.get(GROUP_SETTINGS_LOADER) as GroupSettingsDataLoader | undefined;
  if (currentLoader != null) return currentLoader;

  const loader = new DataLoader<number, GroupSettingsSchema>(async (groupIds) => {
    const { data } = await input.goalClient.send<GoalGetManyGroupSettings.Response, GoalGetManyGroupSettings.Request>(
      GoalGetManyGroupSettings.pattern,
      { data: { userId: input.userId, groupIds: [...groupIds] } },
    );
    const settingsByGroupId = new Map(data.map((settings) => [settings.groupId, settings]));

    return groupIds.map((groupId) => {
      const settings = settingsByGroupId.get(groupId);
      if (settings == null) return new ExceptionGroupSettingsNotFound({ groupId });

      return {
        eventColor: settings.eventColor,
        eventSelectedColor: settings.eventSelectedColor,
        lineColor: settings.lineColor,
        textColor: settings.textColor,
        eventColorDark: settings.eventColorDark,
        eventSelectedColorDark: settings.eventSelectedColorDark,
        lineColorDark: settings.lineColorDark,
        textColorDark: settings.textColorDark,
        isDefault: settings.isDefault,
        isVisible: settings.isVisible,
        isReadonly: settings.isReadonly,
      };
    });
  });

  input.context.loaders.set(GROUP_SETTINGS_LOADER, loader);
  return loader;
}

export { getGroupSettingsDataLoader, GroupSettingsDataLoader };
