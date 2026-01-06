import { Module } from '@nestjs/common';
import { TasksApplicationModule } from './application/tasks-application.module';
import { TasksInfrastructureModule } from './infrastructure/tasks-infrastructure.module';
import { TasksPresentationModule } from './presentation/tasks-presentation.module';

/* TODO: use cases
 *   [x] создание task (groupId?:)
 *   [x] создание task IN BOX
 *   [x] создание группы IN BOX
 *   [] обновление task (не даем менять группу)
 *   [] архивация task (в UI это удаление, под капотом архивация)
 *   [] прикрепление в группу
 *   [] открепление от группы
 *   [] получение tasks для IN BOX
 *   [] получение tasks для ежедневника
 *
 *   [] -- второстепенные ---
 *   [] клонирование task
 *   [] полное удаление task
 *   []
 *   []
 *   []
 *   []
 *   []
 *   []
 *   []
 * */

@Module({
  imports: [TasksPresentationModule, TasksApplicationModule, TasksInfrastructureModule],
})
export class TasksModule {}
