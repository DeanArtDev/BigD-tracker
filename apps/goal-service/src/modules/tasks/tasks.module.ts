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
 *   [x] открепление от группы (подумать о position после удаления)
 *
 *   [] -- ежедневник ---
 *   [] получение tasks для ежедневника
 *
 *   [] -- второстепенные ---
 *   [] полное удаление task
 *   [] добавление тегов
 *   [] свалка дел (фильтры, сортировка, поиск)
 *   [] сортировка по дате добавления IN BOX
 *   [] сортировка по приоритетам IN BOX
 *
 *   [] -- чистка --
 *   [x] удалить libs/api-contracts/src/goal-service
 *   [] удалить в api-gateway старые модули groups, goals, things
 *   []
 *   []
 * */

/**
 * TODO:
 *  -- группы --
 *      группа вычисляет поля на лету, сохраняет в базу только после этапа завершения цели
 *
 *   [x] создание группы
 *   [x] обновить конфиги для api-contracts (можно использовать aliases)
 *   [x] добавил санитайзер для поля group.description
 *   [x] inbox в отдельном (use-case, service, checker, repository)
 *   [x] редактирование группы
 *   [x] создание дела в inbox не имеет startDate, recurrence
 *   [] удаление группы
 *   [] список доступных групп для юзера (все кроме DONE)
 *   [] прикрепление группы к цели
 *   [] открепление группы от цели
 * */

@Module({
  imports: [TasksPresentationModule, TasksApplicationModule, TasksInfrastructureModule],
})
export class TasksModule {}
