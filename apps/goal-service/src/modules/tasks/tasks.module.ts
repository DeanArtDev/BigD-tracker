import { Module } from '@nestjs/common';
import { TasksApplicationModule } from './application/tasks-application.module';
import { TasksDomainModule } from './domain/tasks-domain.module';
import { TasksInfrastructureModule } from '@/modules/tasks/infrastructure/tasks-infrastructure.module';
import { TasksPresentationModule } from './presentation/tasks-presentation.module';

/* TODO: use cases
 *   [] создание task (groupId?:)
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

/* TODO:
 *   [x] UoW
 *   [x] layer exceptions
 *   [x] request context
 *   [] exception filter для rpc exceptions
 *   [] exception filter для ошибок слоев
 *   [] создать exceptions для presentation layer
 *   [x] обработать все неизвестные ошибки
 *   []
 *   []
 *
 * */

@Module({
  imports: [
    TasksPresentationModule,
    TasksApplicationModule,
    TasksDomainModule,
    TasksInfrastructureModule,
  ],
})
export class TasksModule {}
