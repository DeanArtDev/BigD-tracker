import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';

function groupSettingsQuery(db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('group_settings')
    .innerJoin('groups', 'groups.id', 'group_settings.group_id')
    .select([
      'group_settings.group_id as groupId',
      'group_settings.event_color as eventColor',
      'group_settings.event_selected_color as eventSelectedColor',
      'group_settings.line_color as lineColor',
      'group_settings.text_color as textColor',
      'group_settings.event_color_dark as eventColorDark',
      'group_settings.event_selected_color_dark as eventSelectedColorDark',
      'group_settings.line_color_dark as lineColorDark',
      'group_settings.text_color_dark as textColorDark',
      'group_settings.is_default as isDefault',
      'group_settings.is_visible as isVisible',
      'group_settings.is_readonly as isReadonly',
    ]);
}

export { groupSettingsQuery };
