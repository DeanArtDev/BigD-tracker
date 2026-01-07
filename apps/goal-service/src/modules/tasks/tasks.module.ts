import { Module } from '@nestjs/common';
import { TasksApplicationModule } from './application/tasks-application.module';
import { TasksInfrastructureModule } from './infrastructure/tasks-infrastructure.module';
import { TasksPresentationModule } from './presentation/tasks-presentation.module';

/* TODO: use cases
 *   [x] создание task (groupId?:)
 *   [x] создание task IN BOX
 *   [x] создание группы IN BOX
 *   [x] получение tasks для IN BOX
 *   [] редактирование task IN BOX (не даем менять группу, менять вес)
 *   [x] редактирование task (не даем менять группу)
 *
 *   [] архивация task (в UI это удаление, под капотом архивация)
 *   [] прикрепление к группе
 *   [] открепление от группы
 *   [] получение tasks для ежедневника
 *
 *   [] -- второстепенные ---
 *   [] клонирование task
 *   [] полное удаление task
 *   [] добавление тегов
 *
 *   [] прикрепление к группе IN BOX (вернуть в обратно в помойку)
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
