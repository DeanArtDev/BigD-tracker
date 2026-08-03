//FIXME: delete
# Интеграция Diary Calendar с backend

Этот документ — пошаговая инструкция для реализации синхронизации между DayFlow, GraphQL/Apollo и backend дел.

Цель документа: разработчик открывает его, выбирает первый невыполненный пункт и понимает, что именно нужно сделать, где это сделать, какие крайние случаи обработать и как проверить результат.

## 1. Целевая архитектура

Backend является единственным постоянным источником истины.

- DayFlow хранит быстрое локальное UI-состояние календаря.
- Apollo используется как транспорт и кеш запросов, но не как единственный store календаря.
- Диалоги, drag-and-drop и контекстные меню изменяют только DayFlow.
- Отдельный слой синхронизации преобразует изменения DayFlow в GraphQL mutations.
- Ответ backend всегда считается каноническим и повторно применяется в DayFlow.
- Данные query применяются в DayFlow с `source: 'remote'`, чтобы не вызвать обратную mutation.

Целевой поток локального изменения:

```text
DiaryEventDialog / drag / resize / context menu / paste
  -> DayFlow Event изменён локально
  -> subscribeEventChanges
  -> mutation
  -> backend возвращает каноническую Task
  -> Task преобразуется в Event
  -> applyEventsChanges(..., false, 'remote')
```

Целевой поток чтения:

```text
DayFlow сообщает новый visible range
  -> query getDiaryTasks(from, to, groups)
  -> Task[] преобразуется в Event[]
  -> вычисляется diff с уже загруженным диапазоном
  -> applyEventsChanges(diff, false, 'remote')
```

## 2. Границы ответственности

### `DiaryDialogProvider`

Должен:

- открывать и закрывать форму;
- создавать или обновлять Event через `ICalendarApp`;
- преобразовывать данные формы через `DiaryDialogActions`;
- показывать ошибки локальной валидации формы.

Не должен:

- вызывать GraphQL mutations;
- обновлять Apollo cache;
- выполнять refetch;
- знать о rollback сетевых операций.

### `DiaryEventContextMenu` и `DiaryGridContextMenu`

Должны:

- вызывать `app.addEvent`, `app.updateEvent` или `app.deleteEvent`;
- закрывать меню;
- выполнять только локальные UI-действия, например запись Event в clipboard.

Не должны напрямую вызывать task mutations.

### `useCallbacks`

Используется для UI-callbacks и интеграционных callbacks самого DayFlow, но не должен быть основным persistence-слоем.

Причины:

- `onEventUpdate` не содержит состояние `before`;
- create/update/delete имеют разную последовательность выполнения;
- `onEventBatchChange` не покрывает все `drag`, `resize` и `remote` изменения;
- rollback через callbacks получается ненадёжным.

### Новый `useDiaryCalendarSync`

Рекомендуемый файл:

```text
diary-calendary/model/use-diary-calendar-sync.ts
```

Он должен владеть:

- query видимого диапазона;
- подпиской `subscribeVisibleRangeChange`;
- подпиской `subscribeEventChanges`;
- task mutations;
- очередью операций на Event;
- optimistic reconciliation;
- rollback;
- очисткой Apollo cache;
- защитой от устаревших query/mutation ответов.

Подключается один раз после создания приложения DayFlow:

```tsx
const calendar = useCalendarApp(config);

useDiaryCalendarSync({ app: calendar.app });
```

## 3. Что уже существует

- REST/RMQ query дневника: `GET /tasks/diary` и `GoalGetDiaryTasks`.
- Backend query принимает `from`, `to` и опциональные `group`.
- Backend возвращает обычные и рассчитанные виртуальные recurring tasks.
- GraphQL mutations уже существуют для create, update, clone, delete, complete delete, finish, recovery, assign и unassign.
- `DiaryDialogActions` уже умеет преобразовывать Task в Event и Event в Task.
- В `Event.meta` уже хранятся `priority` и `status`.
- `DiaryDialogProvider` уже создаёт и обновляет Event через DayFlow.

## 4. Известные пробелы перед началом синхронизации

- В GraphQL API отсутствует `getDiaryTasks`.
- В `DiaryCalendarProvider` пока находятся тестовые calendars и events.
- В `useCallbacks` пока стоят `console.log` вместо persistence.
- Нет client-side range query и менеджера diary cache.
- Нет reconciliation временного Event ID с серверным Task ID.
- Нет rollback create/update/delete.
- Нет сериализации нескольких mutations одного Event.
- Нет защиты от устаревших ответов query при быстрой навигации.
- `TaskCreateInput` не содержит recurrence, хотя форма и update могут работать с recurrence.
- Assign, unassign и finish GraphQL documents запрашивают только часть `TaskSchema`.
- В модели Task пока нет `version` или `updatedAt` для обнаружения конкурентных изменений.

## 5. Порядок реализации

Выполнять пункты последовательно.

### Этап 1. Добавить GraphQL query дневника

- [ ] Добавить GraphQL input `GetDiaryTasksInput` с `from`, `to`, `group`.
- [ ] Добавить GraphQL connection/result с `items: TaskSchema[]`.
- [ ] Добавить resolver, использующий существующий `GoalGetDiaryTasks`.
- [ ] Возвращать полный `TaskFragment` для каждого дела.
- [ ] Добавить query document `GET_DIARY_TASKS_QUERY` в web-client.
- [ ] Запустить GraphQL codegen.
- [ ] Добавить shape options или lazy query hook для интеграционного слоя.
- [ ] Добавить в `TaskCacheManager` сброс поля `getDiaryTasks`.
- [ ] Добавить backend и client tests для пустого результата, диапазона, группы и recurrence.

### Этап 2. Реализовать read-side синхронизацию

- [ ] Создать `useDiaryCalendarSync`.
- [ ] Подписаться на `app.subscribeVisibleRangeChange`.
- [ ] Отдельно выполнить первую загрузку: подписка может быть установлена после initial range event.
- [ ] Преобразовать DayFlow range в backend range.
- [ ] Загрузить `Task[]`.
- [ ] Преобразовать задачи через `DiaryDialogActions.mapTaskToEvent`.
- [ ] Вычислить `add`, `update`, `delete` только внутри загруженного диапазона.
- [ ] Применить diff через `app.applyEventsChanges(diff, false, 'remote')`.
- [ ] Не удалять Events из других ранее загруженных диапазонов.
- [ ] Не применять устаревший ответ после перехода пользователя в другой диапазон.
- [ ] Удалить тестовые Events из `DiaryCalendarProvider` после подключения query.

### Этап 3. Реализовать write-side синхронизацию

- [ ] Подписаться на `app.subscribeEventChanges`.
- [ ] Полностью игнорировать изменения с `source === 'remote'`.
- [ ] Маршрутизировать `create`, `update`, `delete` в отдельные handlers.
- [ ] Добавить очередь по `event.id`, чтобы mutations одного Event выполнялись последовательно.
- [ ] Перехватывать ошибки внутри listener: DayFlow не ожидает async subscriber.
- [ ] После успешной mutation применять канонический ответ с `source: 'remote'`.
- [ ] После ошибки выполнять rollback с `source: 'remote'`.
- [ ] Убрать persistence из `onEventCreate`, `onEventUpdate`, `onEventDelete`, если она туда временно добавлялась.

### Этап 4. Добавить кеши и тесты

- [ ] Добавить cache invalidation matrix для каждой mutation.
- [ ] В конце каждой завершённой операции вызывать `client.cache.gc()`.
- [ ] Добавить unit tests мапперов и diff.
- [ ] Добавить integration tests sync hook с mocked Apollo.
- [ ] Добавить E2E-сценарии диалога, drag, resize, delete, paste и group move.
- [ ] Удалить временные `console.log`.

## 6. Работа с visible range

DayFlow передаёт диапазон с правой границей, соответствующей началу следующего периода. Например, Day view может передать начало текущего дня и начало следующего дня.

Текущий backend трактует `to` как включительный календарный день и внутри вызывает `endOf('date')`.

Поэтому нельзя напрямую форматировать DayFlow `end` в backend `to`: это загрузит лишний день.

Нужно преобразовать диапазон примерно так:

```ts
const from = timeAndDate(start).format(TASK_DATE_FORMAT);
const to = timeAndDate(end).subtract(1, 'millisecond').format(TASK_DATE_FORMAT);
```

Точные format constants должны браться из `TaskDomain`/проекта. Не использовать `new Date` для проектной работы с датами; использовать фасад `timeAndDate`.

Обработать:

- Day view;
- Week view;
- Month view с днями соседних месяцев;
- Year view;
- Agenda;
- timezone приложения;
- переход через DST;
- быстрые переходы назад/вперёд;
- одинаковый диапазон, вызванный разными причинами;
- смену списка видимых групп.

Для защиты от устаревших ответов хранить request sequence или range key:

```ts
type DiaryRangeKey = `${string}:${string}:${string}`;
```

Ответ можно применять только если он всё ещё актуален либо если реализация поддерживает накопительный кеш диапазонов.

## 7. Применение server data в DayFlow

Использовать:

```ts
app.applyEventsChanges(changes, false, 'remote');
```

Не использовать для server data обычные:

```ts
app.addEvent(event);
app.updateEvent(id, event);
app.deleteEvent(id);
```

Иначе изменения могут снова попасть в write-side и породить mutation loop.

Subscriber всё равно получает remote changes, поэтому в нём обязательна проверка:

```ts
if (change.source === 'remote') return;
```

`isPending: true` нельзя использовать как индикатор выполняющейся сетевой mutation. В DayFlow этот параметр предназначен для промежуточного визуального состояния и может не создать обычный store event.

Сетевой pending хранить отдельно, например:

```ts
Map<Event['id'], PendingOperation>
```

или в отдельном React state. Не сохранять служебный pending на backend.

## 8. Общие требования ко всем mutations

Каждый mutation handler должен выполнять одинаковый pipeline:

1. Получить `EventChange`.
2. Проверить `source`.
3. Проверить, что Event относится к task calendar, а не external subscription.
4. Сформировать mutation input через единый mapper.
5. Поставить операцию в очередь конкретного Event.
6. Пометить Event как pending в локальном sync state.
7. Выполнить mutation.
8. Проверить наличие `data` и ожидаемого поля ответа.
9. Применить канонический ответ backend с `source: 'remote'`.
10. Обновить или сбросить затронутые Apollo caches.
11. Вызвать `client.cache.gc()`.
12. Снять pending.
13. При ошибке выполнить rollback или refetch канонического состояния.
14. Передать ошибку в общий exception notificator/useNotify.

Общие edge cases:

- mutation завершилась после перехода пользователя на другой range;
- Event уже удалён другой локальной операцией;
- Event перемещён повторно до ответа первой mutation;
- backend вернул другой ID, status, groupId или dates;
- истёк access token;
- network error без ответа backend;
- mutation была применена backend, но клиент потерял ответ;
- повторная отправка create создала дубль;
- виртуальная или override Task вернула другой канонический ID;
- Event ушёл за пределы текущего range после update;
- Event пришёл в текущий range после update;
- серверная Task больше не проходит фильтр видимых групп.

Для create желательно добавить `clientMutationId`/idempotency key в backend contract. Без него автоматический retry create может создавать дубликаты.

## 9. Create task

### Источники create

- создание через `DiaryEventDialog`;
- создание через grid context menu;
- paste скопированного Event;
- возможное drag-create DayFlow;

### Mutation

Использовать `createTask`:

```ts
{
  name,
  description,
  priority,
  startDate,
  deadline,
  groupId,
}
```

### Алгоритм

1. DayFlow уже содержит Event с временным `generateUniKey()`.
2. Преобразовать Event в Task через `DiaryDialogActions.mapEventToTask`.
3. Проверить обязательные `name`, `startDate`, `deadline`, `priority`.
4. Преобразовать `EMPTY_GROUP_ID` в отсутствие `groupId`.
5. Выполнить `createTask`.
6. Получить полный `TaskSchema`.
7. Преобразовать ответ в Event.
8. Одной remote-транзакцией удалить временный Event и добавить серверный.

```ts
app.applyEventsChanges(
  {
    delete: [temporaryEvent.id],
    add: [DiaryDialogActions.mapTaskToEvent(createdTask)],
  },
  false,
  'remote',
);
```

Не менять ID через `updateEvent(temporaryId, { id: serverId })`: внутренний store может остаться индексирован по временному ID.

### Ошибка

- удалить временный Event с `source: 'remote'`;
- оставить введённые данные доступными для повторного открытия формы, если UX это предусматривает;
- показать ошибку;
- не выполнять автоматический create retry без idempotency key.

### Кеши

- diary query текущего диапазона;
- current tasks per page;
- assignable tasks;
- target group/inbox, если указан `groupId`;
- `cache.gc()`.

### Recurrence blocker

`TaskCreateInput` сейчас не содержит recurrence. Перед включением создания повторяемых дел нужно выбрать одно из решений:

- расширить `TaskCreateInput` и backend create flow полем recurrence;
- либо временно запретить recurrence в Diary create form.

Нельзя молча отбросить recurrence из формы.

## 10. Update task

### Источники update

- редактирование через диалог;
- drag;
- resize;
- изменение `allDay`;
- изменение priority/status meta;
- paste/update сторонней командой;
- перенос между calendars.

### Определение изменений

Использовать `change.before` и `change.after`.

Разделять:

- обычные task fields;
- смену `calendarId`/groupId;
- служебные DayFlow fields, которые backend не хранит;
- визуально эквивалентные значения дат.

Не отправлять mutation, если backend-relevant fields не изменились.

### Обычный update

Использовать `updateTask` для:

- `name`;
- `description`;
- `priority`;
- `startDate`;
- `deadline`;
- `recurrence`, когда она поддержана выбранным типом Task.

После ответа заменить локальные поля каноническим `TaskSchema` через remote update.

### Drag и resize

- источник будет `drag` или `resize`;
- mutation отправлять после финального drop/resize, не на каждом preview frame;
- быструю последовательность изменений одного Event сериализовать;
- если есть несколько ещё не отправленных update одного Event, допустимо объединить их в последний `after`;
- при ошибке восстановить `change.before` с `source: 'remote'`.

### Event вышел из visible range

Если канонический Event больше не пересекает активный диапазон, удалить его из текущего DayFlow range с `source: 'remote'`.

Если после ответа Event должен появиться в активном диапазоне, добавить его.

### Конкурентный update

Сейчас Task не содержит `version`/`updatedAt`, поэтому фактически действует last-write-wins.

Для надёжной синхронизации нескольких клиентов рекомендуется:

- добавить `version` или `updatedAt` в TaskSchema и Event.meta;
- передавать expected version в mutation;
- на conflict делать `TaskById`/range refetch;
- применять серверную Task с `source: 'remote'`;
- уведомлять пользователя о конфликте.

## 11. Assign task to group

Смена `calendarId` с `EMPTY_GROUP_ID` или другой группы на реальную группу не входит в `TaskUpdateInput`.

Использовать `assignTaskToGroup`.

### Алгоритм

1. Сравнить `before.calendarId` и `after.calendarId`.
2. Преобразовать новый calendar ID в `GroupId`.
3. Выполнить assign mutation.
4. Запросить в document полный `TaskFragment`, а не только `id` и `groupId`.
5. Применить каноническую Task как remote Event.

### Ошибка

- вернуть `calendarId` из `before`;
- показать ошибку;
- refetch обеих групп, если неизвестно, успела ли mutation примениться.

### Кеши

- исходная группа/inbox;
- целевая группа;
- planner init;
- assignable tasks;
- current tasks per page;
- diary queries;
- `cache.gc()`.

## 12. Unassign task from group

Смена реального `calendarId` на `EMPTY_GROUP_ID` означает `unassignTaskToGroup`.

Mutation input требует прежний `groupId`, поэтому брать его нужно из `before.calendarId`, а не из `after`.

### Ошибка

- вернуть прежний calendar ID;
- refetch прежней группы/inbox;
- показать ошибку.

### Кеши

- прежняя группа/inbox;
- planner init;
- assignable tasks;
- current tasks per page;
- diary queries;
- `cache.gc()`.

## 13. Одновременный update и group move

Один EventChange может одновременно изменить даты/название и `calendarId`.

Текущий API требует две mutations: `updateTask` и assign/unassign.

Варианты:

1. Последовательно выполнить обе mutations, затем refetch `TaskById`.
2. Добавить backend mutation, атомарно обновляющую fields и groupId.

Для первой реализации допустим вариант 1, но при ошибке второй mutation нельзя считать простой локальный rollback достаточным: первая mutation уже могла сохраниться. В этом случае обязательно запросить каноническую Task с backend и применить её как remote Event.

Для окончательной архитектуры предпочтительна одна атомарная backend-команда.

## 14. Delete task

`deleteTask` выполняет мягкое удаление.

### Источники delete

- event context menu;
- keyboard shortcut;
- cut;
- другие task actions.

### Рекомендуемая стратегия

Optimistic delete:

1. DayFlow удаляет Event.
2. `subscribeEventChanges` получает `{ type: 'delete', event }`.
3. Выполняется `deleteTask`.
4. При успехе Event остаётся удалённым.
5. При ошибке исходный Event добавляется обратно с `source: 'remote'`.

Особый случай: `app.deleteEvent` вызывает `onEventDelete` до локального удаления и ожидает его. Persistence в `onEventDelete` превращает delete в pessimistic flow. Не смешивать этот подход с delete через subscriber, иначе mutation выполнится дважды.

### Recurrence

Удаление virtual/override Event может создать или изменить override на backend. Использовать ID из исходного Event и считать backend response каноническим.

### Cut

Clipboard записывается до delete. Если delete завершился ошибкой и Event восстановлен, clipboard уже содержит Event. Нужно определить UX:

- оставить его как copy;
- либо очистить cut state при rollback.

### Кеши

- удалить/evict нормализованную Task при необходимости;
- deleted tasks;
- current tasks;
- группы/inbox;
- planner init;
- diary queries;
- `cache.gc()`.

## 15. Complete delete task

Полное удаление необратимо и обычно выполняется не из Diary, потому что обычный diary query исключает deleted tasks.

Если действие будет доступно из календаря:

- обязательное подтверждение;
- использовать backend-first стратегию;
- не удалять Event окончательно до успешного ответа;
- после успеха evict Task и все ссылки на неё;
- очистить deleted/current/diary/group caches;
- выполнить `cache.gc()`;
- при ошибке оставить Event без локального изменения.

Проверить, какие типы Task ID разрешены для complete delete. Не отправлять virtual/override ID, если backend contract поддерживает только origin task.

## 16. Clone и paste

`cloneTask(id)` и calendar paste — не одно и то же.

### Clone

Использовать `cloneTask`, когда пользователь хочет создать серверную копию Task без выбора новой позиции календаря.

- mutation возвращает полный `TaskFragment`;
- новый Event добавляется с `source: 'remote'`;
- кеши обновляются как для create.

### Paste here

Paste переносит скопированное событие на выбранную дату/время. Текущий `cloneTask` принимает только ID и не позволяет передать новую дату.

Поэтому paste должен:

1. создать новый локальный Event через `DiaryDialogActions.paste`;
2. породить обычный create change;
3. пройти через `createTask` pipeline.

Если backend должен сохранять связь с оригиналом, контракт clone нужно расширить датами и groupId.

## 17. Finish task

Finish меняет status и, возможно, `cancelReason`/`endDate` в зависимости от backend domain rules.

- не пытаться вручную предсказать полный результат;
- запросить в GraphQL document полный `TaskFragment`;
- преобразовать ответ в Event;
- обновить `Event.meta.status` каноническим значением;
- удалить Event из текущего представления, только если он больше не проходит diary query/filter;
- при ошибке сохранить прежний status;
- очистить current/deleted/group/diary caches;
- выполнить `cache.gc()`.

Finish action может не проходить через `subscribeEventChanges`, если feature сначала вызывает mutation и только потом меняет cache. Нужно выбрать один путь:

- либо feature после успеха применяет Task в DayFlow как remote;
- либо finish сначала меняет Event.meta и далее проходит общий sync pipeline.

Не допускать обе схемы одновременно.

## 18. Recovery task

Recovery обычно инициируется со страницы удалённых задач, а не из Diary.

После успешной mutation:

- получить полный `TaskFragment`;
- проверить, пересекает ли Task текущий visible range;
- если пересекает — добавить/обновить Event с `source: 'remote'`;
- если не пересекает — достаточно инвалидировать diary query;
- обновить target group/inbox;
- очистить deleted/current/assignable caches;
- выполнить `cache.gc()`.

`TaskRecoveryInput.groupId` сейчас обязательный. Отдельно определить восстановление в `EMPTY_GROUP_ID`: нужен ли специальный inbox/empty group ID либо изменение backend contract.

## 19. Calendar/group mutations

DayFlow calendars соответствуют planner groups, но не входят в `subscribeEventChanges`.

Для локальных действий используются:

```ts
onCalendarCreate
onCalendarUpdate
onCalendarDelete
onCalendarMerge
onCalendarReorder
```

Обработать отдельно:

- создание группы;
- переименование и цвет;
- удаление группы;
- merge;
- reorder, если порядок хранится на backend;
- локальную visibility, если она не должна сохраняться на backend.

Remote groups лучше передавать в конфигурацию `calendars`, а не повторно вызывать локальные create/delete callbacks.

`updateCalendar(id, updates, true)` подавляет обычный update callback, но параметр называется pending и требует отдельной проверки поведения. Для create/delete нет `source: 'remote'`, поэтому понадобится отдельный suppression guard или конфигурационная синхронизация.

## 20. Очередь mutations

Минимальная гарантия: operations одного Event выполняются последовательно.

Пример:

```text
update #1: 10:00 -> 11:00
update #2: 11:00 -> 12:00
```

Нельзя допустить, чтобы ответ update #1 приехал после update #2 и вернул Event к 11:00.

Рекомендуемые правила:

- отдельная promise queue на `event.id`;
- ожидающие update можно схлопывать до последнего `after`;
- delete отменяет ещё не отправленные updates;
- update после delete запрещается до reconciliation;
- временный ID create должен быть перенесён на серверный ID вместе с очередью;
- mutation response применяется только если её operation sequence всё ещё актуален;
- при неизвестном результате refetch `TaskById` или visible range.

## 21. Rollback matrix

| Change | Optimistic state | Rollback |
|---|---|---|
| Create | временный Event добавлен | удалить временный Event remote-изменением |
| Update | отображается `after` | восстановить `before` remote-изменением |
| Drag/resize | отображается новая позиция | восстановить `before` |
| Assign | отображается target calendar | вернуть `before.calendarId` или refetch Task |
| Unassign | отображается empty calendar | вернуть исходный calendar ID |
| Delete | Event отсутствует | добавить сохранённый Event обратно |
| Complete delete | локально не менять до ответа | rollback не нужен |
| Finish | зависит от выбранного flow | восстановить предыдущую Task либо refetch |
| Recovery | обычно backend-first | удалить добавленный Event при ошибке |

Все rollback changes применять с `source: 'remote'`.

## 22. Apollo cache matrix

Добавить единый helper, чтобы mutations Diary не копировали cache-логику существующих features вручную.

| Mutation | Diary | Current | Deleted | Assignable | Groups/Inbox | Planner init |
|---|---:|---:|---:|---:|---:|---:|
| Create | да | да | нет | да | target | да |
| Update | да | да | возможно | возможно | затронутые | возможно |
| Assign | да | да | нет | да | source + target | да |
| Unassign | да | да | нет | да | source/inbox | да |
| Delete | да | да | да | возможно | source | да |
| Complete delete | да | да | да | возможно | все ссылки | да |
| Clone | да | да | нет | да | target | да |
| Finish | да | да | возможно | возможно | source | да |
| Recovery | да | да | да | да | target | да |

После evict/modify/refetch в конце handler выполнять:

```ts
client.cache.gc();
```

Для первой реализации допустим refetch активного diary range вместо сложного `cache.modify`. DayFlow уже показывает optimistic Event, поэтому refetch не должен блокировать UI.

## 23. Recurrence cases

Обязательно протестировать отдельно:

- создание origin recurring task;
- редактирование recurrence rule origin task;
- изменение одного virtual occurrence;
- удаление одного occurrence;
- перенос одного occurrence;
- изменение всей серии;
- override, который после mutation получает другой ID;
- canceled recurrence;
- untilDate на границе visible range;
- occurrence в разных timezone/DST;
- перемещение occurrence за пределы range;
- query, возвращающий virtual view вместо origin task.

До поддержки recurrence на create UI должен явно блокировать неподдерживаемый сценарий.

## 24. Undo/redo

В текущем DayFlow `app.undo()` восстанавливает внутренний snapshot, но не создаёт нормальный `EventChange` для backend sync.

Поэтому текущий keyboard shortcut:

```ts
undo: (app) => void app.undo()
```

небезопасен после подключения persistence.

До реализации server-aware history необходимо:

- либо отключить undo;
- либо заменить его собственным стеком обратных mutations;
- либо после undo вычислять diff с последним подтверждённым backend state и явно синхронизировать;
- либо делать refetch visible range, понимая, что это фактически отменит локальный undo.

Redo нельзя добавлять, пока не определена серверная история операций.

## 25. Server push и несколько вкладок

Это необязательно для первого этапа, но архитектура должна позволять добавить WebSocket/SSE/GraphQL subscriptions.

Server push change должен:

- обновить Apollo cache;
- преобразовать Task в Event;
- применить изменение с `source: 'remote'`;
- не запускать mutation;
- учитывать pending local operation;
- разрешать conflict по version/updatedAt.

Для синхронизации вкладок можно использовать `BroadcastChannel`, но сообщения другой вкладки также должны считаться remote относительно текущего DayFlow.

## 26. Ошибки и UX

Нужно различать:

- validation/domain error — rollback и показать точное сообщение;
- not found — удалить Event либо refetch range;
- version conflict — refetch Task и сообщить о конфликте;
- unauthenticated — стандартный auth flow;
- network error — rollback либо оставить failed/pending state согласно выбранному UX;
- timeout/unknown result — не повторять create без idempotency key;
- partial success нескольких mutations — refetch каноническую Task.

Не оставлять ошибки только в `console.error`.

## 27. Тестовый план

### Unit tests

- [ ] `mapTaskToEvent` для empty group, real group и meta.
- [ ] `mapEventToTask` для timed/all-day Event.
- [ ] range conversion DayFlow -> backend.
- [ ] range diff add/update/delete.
- [ ] backend-relevant Event comparison.
- [ ] group move detection.
- [ ] rollback builders.
- [ ] temporary ID reconciliation.
- [ ] per-event queue ordering.

### Integration tests

- [ ] Remote query не вызывает mutation.
- [ ] Local create вызывает ровно одну create mutation.
- [ ] Create success заменяет временный ID.
- [ ] Create error удаляет временный Event.
- [ ] Update error восстанавливает `before`.
- [ ] Drag и resize вызывают mutation после завершения.
- [ ] Два update одного Event применяются в правильном порядке.
- [ ] Assign и unassign выбираются по `calendarId`.
- [ ] Delete error возвращает Event.
- [ ] Устаревший range response не заменяет актуальный range.
- [ ] Event за пределами range не удаляется чужим query.
- [ ] `source: 'remote'` не создаёт write-back loop.

### E2E tests

- [ ] Открыть Diary и получить события текущего дня.
- [ ] Перейти на неделю/месяц/год и получить правильный range.
- [ ] Создать Event и после ответа увидеть server ID.
- [ ] Отредактировать Event через диалог.
- [ ] Перетащить и изменить длительность Event.
- [ ] Переместить Event между группами.
- [ ] Удалить Event.
- [ ] Copy/paste на другую дату.
- [ ] Проверить rollback при отказе backend.
- [ ] Проверить virtual/override occurrence.

## 28. Definition of done

Интеграция считается завершённой, когда:

- в `DiaryCalendarProvider` нет тестовых Events;
- события загружаются по активному visible range;
- remote query никогда не порождает mutations;
- create/update/delete работают из диалога, drag, resize и context menu;
- group move вызывает assign/unassign;
- temporary IDs заменяются серверными;
- ошибки не оставляют DayFlow в неконсистентном состоянии;
- mutations одного Event не применяются в неправильном порядке;
- recurrence либо полностью поддержана, либо явно заблокирована;
- кеши других planner views остаются согласованными;
- после cache eviction вызывается `cache.gc()`;
- undo либо синхронизирован с backend, либо отключён;
- отсутствуют persistence-вызовы в UI-диалогах и контекстных меню;
- unit, integration и E2E-сценарии из этого документа проходят.

## 29. Следующий конкретный шаг

Первый следующий шаг — добавить `getDiaryTasks` в GraphQL API Gateway и web-client, не подключая mutations.

Результат этого шага должен позволять выполнить вручную или в тесте:

```text
visible DayFlow range
  -> GraphQL getDiaryTasks
  -> Task[]
  -> DiaryDialogActions.mapTaskToEvent
  -> applyEventsChanges(..., false, 'remote')
```

Только после стабильной read-side синхронизации переходить к `subscribeEventChanges` и create mutation.
