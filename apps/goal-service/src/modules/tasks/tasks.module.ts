import { Module } from '@nestjs/common';
import { TasksApplicationModule } from './application/tasks-application.module';
import { TasksInfrastructureModule } from './infrastructure/tasks-infrastructure.module';
import { TasksPresentationModule } from './presentation/tasks-presentation.module';

/* TODO: use cases
 *   [x] создание task (groupId?:)
 *   [x] создание task IN BOX
 *   [x] создание группы IN BOX
 *   [x] получение tasks для IN BOX
 *   [х] редактирование task IN BOX (не даем менять группу, менять вес)
 *   [x] редактирование task (не даем менять группу)
 *   [x] удаление task (в UI это удаление, под капотом soft delete)
 *   [x] клонирование task
 *   [x] прикрепление к группе (открепление от старой, прикрепление к новой) (не IN BOX)
 *   [x] прикрепление к группе IN BOX (из другого места в IN BOX)
 *
 *   [] открепление от группы (подумать о position после удаления)
 *   [] получение tasks для ежедневника
 *   []
 *
 *   [] -- второстепенные ---
 *   [] полное удаление task
 *   [] добавление тегов
 *   [] свалка дел (фильтры, сортировка, поиск)
 *
 *   [] сортировка по дате добавления IN BOX
 *   [] сортировка по приоритетам IN BOX
 *   []
 *   []
 *   []
 *   [] -- чистка --
 *   [] прочистить api-contracts/things
 *   []
 *   []
 *   []
 *   []
 * */

@Module({
  imports: [TasksPresentationModule, TasksApplicationModule, TasksInfrastructureModule],
})
export class TasksModule {}
