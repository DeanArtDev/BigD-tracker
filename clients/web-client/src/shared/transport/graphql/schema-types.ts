export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type CursorPaginationMeta = {
  __typename?: 'CursorPaginationMeta';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type GetAssignableTasksInput = {
  /** Исключает дела в этих группах из выдачи */
  groupIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  search: Scalars['String']['input'];
};

export type GetDiaryTasksInput = {
  /** Начало диапазона дат */
  from: Scalars['String']['input'];
  /** IDs групп */
  group?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Конец диапазона дат */
  to: Scalars['String']['input'];
};

export type GetGroupInput = {
  groupId: Scalars['Int']['input'];
};

export type GetGroupListInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['Int']['input']>>;
  limit: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};

export type GetGroupTasksInput = {
  order?: InputMaybe<GroupTaskOrder>;
};

export type GetInboxResponse = {
  __typename?: 'GetInboxResponse';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  tasks: TasksConnection;
};

export type GetInboxResponseTasksArgs = {
  input?: InputMaybe<GetInboxTasksInput>;
};

export type GetInboxTasksInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Int']['input'];
  priority?: InputMaybe<Array<TaskPriority>>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<TaskStatus>>;
};

export type GetPlannerInit = {
  __typename?: 'GetPlannerInit';
  inboxId: Scalars['Int']['output'];
  inboxTaskCount: Scalars['Int']['output'];
};

export type GetTaskByIdInput = {
  id: Scalars['String']['input'];
};

export type GetTasksCursorInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  groupIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  limit: Scalars['Int']['input'];
  priority?: InputMaybe<Array<TaskPriority>>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<TaskStatus>>;
};

export type GetTasksPerPageInput = {
  groupIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  page: Scalars['Int']['input'];
  perPage: Scalars['Int']['input'];
  priority?: InputMaybe<Array<TaskPriority>>;
  recurring?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<GetTasksPerPageSortInput>;
  status?: InputMaybe<Array<TaskStatus>>;
};

export type GetTasksPerPageSortInput = {
  deadline?: InputMaybe<SortDirection>;
  priority?: InputMaybe<SortDirection>;
  startDate?: InputMaybe<SortDirection>;
};

export type GroupCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type GroupDeleteInput = {
  groupId: Scalars['Int']['input'];
};

export type GroupInfoSchema = {
  __typename?: 'GroupInfoSchema';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

/** Группа */
export type GroupSchema = {
  __typename?: 'GroupSchema';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  progress: Scalars['Int']['output'];
  settings?: Maybe<GroupSettingsSchema>;
  status: GroupStatus;
  taskCount?: Maybe<Scalars['Int']['output']>;
  tasks: TasksConnection;
  userId: Scalars['Int']['output'];
};

/** Группа */
export type GroupSchemaTasksArgs = {
  input?: InputMaybe<GetGroupTasksInput>;
};

/** Настройки группы */
export type GroupSettingsSchema = {
  __typename?: 'GroupSettingsSchema';
  eventColor: Scalars['String']['output'];
  eventColorDark: Scalars['String']['output'];
  eventSelectedColor: Scalars['String']['output'];
  eventSelectedColorDark: Scalars['String']['output'];
  isDefault: Scalars['Boolean']['output'];
  isReadonly: Scalars['Boolean']['output'];
  isVisible: Scalars['Boolean']['output'];
  lineColor: Scalars['String']['output'];
  lineColorDark: Scalars['String']['output'];
  textColor: Scalars['String']['output'];
  textColorDark: Scalars['String']['output'];
};

export type GroupSettingsUpdateInput = {
  eventColor?: InputMaybe<Scalars['String']['input']>;
  eventColorDark?: InputMaybe<Scalars['String']['input']>;
  eventSelectedColor?: InputMaybe<Scalars['String']['input']>;
  eventSelectedColorDark?: InputMaybe<Scalars['String']['input']>;
  groupId: Scalars['Int']['input'];
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  isReadonly?: InputMaybe<Scalars['Boolean']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  lineColor?: InputMaybe<Scalars['String']['input']>;
  lineColorDark?: InputMaybe<Scalars['String']['input']>;
  textColor?: InputMaybe<Scalars['String']['input']>;
  textColorDark?: InputMaybe<Scalars['String']['input']>;
};

/** Статусы группы */
export enum GroupStatus {
  Done = 'DONE',
  InProgress = 'IN_PROGRESS',
  NotStarted = 'NOT_STARTED',
}

/** Порядок дел внутри группы */
export enum GroupTaskOrder {
  Group = 'Group',
}

export type GroupUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  tasks?: InputMaybe<Array<GroupUpdateTaskInput>>;
};

export type GroupUpdateTaskInput = {
  id: Scalars['String']['input'];
};

export type GroupsConnection = {
  __typename?: 'GroupsConnection';
  items: Array<GroupSchema>;
  meta: CursorPaginationMeta;
};

export type LoginUserInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MeRes = {
  __typename?: 'MeRes';
  avatar?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  screenName?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Добавить дело в группу */
  assignTaskToGroup: TaskSchema;
  /** Клонирование дела */
  cloneTask: TaskSchema;
  /** Полное удаление дела */
  completeDeleteTask: Scalars['Int']['output'];
  /** Создание группы */
  createGroup: GroupSchema;
  /** Создание дела */
  createTask: TaskSchema;
  /** Удаление дела */
  deleteTask: TaskSchema;
  /** Завершение дела */
  finishTask: TaskSchema;
  /** Удаление группы */
  groupDelete: Scalars['Boolean']['output'];
  /** Продление токена сессии, необходимы access и refresh токены одновременно */
  refresh: Scalars['Boolean']['output'];
  /** Восстановление дела */
  taskRecovery: TaskSchema;
  /** Удалить дело из группы */
  unassignTaskToGroup: TaskSchema;
  /** Редактирование группы */
  updateGroup: GroupSchema;
  /** Редактирование настроек группы */
  updateGroupSettings: GroupSettingsSchema;
  /** Редактирование дела */
  updateTask: TaskSchema;
  /** Редактирование настроек дела */
  updateTaskSettings: TaskSettingsSchema;
  /** Логин по email/паролю. Выставляет httpOnly cookies access/refresh. */
  userLogin: Scalars['Boolean']['output'];
  /** Выход пользователя из системы на одном устройстве */
  userLogout: Scalars['Boolean']['output'];
};

export type MutationAssignTaskToGroupArgs = {
  input: TaskAssignInput;
};

export type MutationCloneTaskArgs = {
  input: TaskCloneInput;
};

export type MutationCompleteDeleteTaskArgs = {
  input: TaskCompleteDeleteInput;
};

export type MutationCreateGroupArgs = {
  input: GroupCreateInput;
};

export type MutationCreateTaskArgs = {
  input: TaskCreateInput;
};

export type MutationDeleteTaskArgs = {
  input: TaskDeleteInput;
};

export type MutationFinishTaskArgs = {
  input: TaskFinishInput;
};

export type MutationGroupDeleteArgs = {
  input: GroupDeleteInput;
};

export type MutationTaskRecoveryArgs = {
  input: TaskRecoveryInput;
};

export type MutationUnassignTaskToGroupArgs = {
  input: TaskUnassignInput;
};

export type MutationUpdateGroupArgs = {
  input: GroupUpdateInput;
};

export type MutationUpdateGroupSettingsArgs = {
  input: GroupSettingsUpdateInput;
};

export type MutationUpdateTaskArgs = {
  input: TaskUpdateInput;
};

export type MutationUpdateTaskSettingsArgs = {
  input: TaskSettingsUpdateInput;
};

export type MutationUserLoginArgs = {
  input: LoginUserInput;
};

export type Query = {
  __typename?: 'Query';
  getAssignableGroups: Array<GroupInfoSchema>;
  /** Получение списка дел, доступных для назначения в группу */
  getAssignableTasks: Array<TaskSchema>;
  /** Получение списка групп для ежедневника */
  getDiaryGroupList: Array<GroupSchema>;
  /** Получение дел для ежедневника */
  getDiaryTasks: Array<TaskSchema>;
  /** Получение группы */
  getGroup: GroupSchema;
  /** Получение списка групп */
  getGroupList: GroupsConnection;
  getInbox: GetInboxResponse;
  getPlannerInit: GetPlannerInit;
  /** Получение дела по id */
  getTaskById: TaskSchema;
  /** Получение списка дел */
  getTasksCursor: TasksConnection;
  /** Получение списка дел с постраничной пагинацией */
  getTasksPerPage: TasksPerPageConnection;
  me: MeRes;
};

export type QueryGetAssignableTasksArgs = {
  input: GetAssignableTasksInput;
};

export type QueryGetDiaryTasksArgs = {
  input: GetDiaryTasksInput;
};

export type QueryGetGroupArgs = {
  input: GetGroupInput;
};

export type QueryGetGroupListArgs = {
  input: GetGroupListInput;
};

export type QueryGetTaskByIdArgs = {
  input: GetTaskByIdInput;
};

export type QueryGetTasksCursorArgs = {
  input: GetTasksCursorInput;
};

export type QueryGetTasksPerPageArgs = {
  input: GetTasksPerPageInput;
};

/** Частота повторения дела */
export enum RecurrenceFrequency {
  Daily = 'DAILY',
  Hourly = 'HOURLY',
  Minutely = 'MINUTELY',
  Monthly = 'MONTHLY',
  Secondly = 'SECONDLY',
  Weekly = 'WEEKLY',
  Yearly = 'YEARLY',
}

/** Направление сортировки */
export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type TaskAssignInput = {
  groupId: Scalars['Int']['input'];
  taskId: Scalars['String']['input'];
};

export type TaskCloneInput = {
  id: Scalars['String']['input'];
};

export type TaskCompleteDeleteInput = {
  id: Scalars['String']['input'];
};

export type TaskCreateInput = {
  deadline?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  priority: TaskPriority;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type TaskDeleteInput = {
  id: Scalars['String']['input'];
};

export type TaskFinishInput = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  type: TaskFinishStatus;
};

/** Статус завершения дела */
export enum TaskFinishStatus {
  Canceled = 'CANCELED',
  Completed = 'COMPLETED',
  Overdue = 'OVERDUE',
}

/** Приоритеты дела */
export enum TaskPriority {
  Delegate = 'Delegate',
  Delete = 'Delete',
  Do = 'Do',
  Plan = 'Plan',
}

export type TaskRecoveryInput = {
  groupId: Scalars['Int']['input'];
  id: Scalars['String']['input'];
};

/** День недели повторения дела */
export enum TaskRecurrenceWeekday {
  Fr = 'FR',
  Mo = 'MO',
  Sa = 'SA',
  Su = 'SU',
  Th = 'TH',
  Tu = 'TU',
  We = 'WE',
}

export type TaskRecurrencyInput = {
  frequency: RecurrenceFrequency;
  interval?: InputMaybe<Scalars['Int']['input']>;
  monthdays?: InputMaybe<Array<Scalars['Int']['input']>>;
  startDate: Scalars['String']['input'];
  untilDate?: InputMaybe<Scalars['String']['input']>;
  weekdays?: InputMaybe<Array<TaskRecurrenceWeekday>>;
  yearmonths?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Дело */
export type TaskSchema = {
  __typename?: 'TaskSchema';
  cancelReason?: Maybe<Scalars['String']['output']>;
  deadline?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  groupId?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  priority: TaskPriority;
  settings?: Maybe<TaskSettingsSchema>;
  startDate?: Maybe<Scalars['String']['output']>;
  status: TaskStatus;
  userId: Scalars['Int']['output'];
};

/** Настройки дела */
export type TaskSettingsSchema = {
  __typename?: 'TaskSettingsSchema';
  icon?: Maybe<Scalars['String']['output']>;
  isAllDay: Scalars['Boolean']['output'];
};

export type TaskSettingsUpdateInput = {
  icon?: InputMaybe<Scalars['String']['input']>;
  isAllDay?: InputMaybe<Scalars['Boolean']['input']>;
  taskId: Scalars['ID']['input'];
};

/** Статусы дела */
export enum TaskStatus {
  Archived = 'ARCHIVED',
  Canceled = 'CANCELED',
  Completed = 'COMPLETED',
  Deleted = 'DELETED',
  InProgress = 'IN_PROGRESS',
  NotStarted = 'NOT_STARTED',
  Overdue = 'OVERDUE',
}

export type TaskUnassignInput = {
  groupId: Scalars['Int']['input'];
  taskId: Scalars['String']['input'];
};

export type TaskUpdateInput = {
  deadline?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  priority: TaskPriority;
  recurrence?: InputMaybe<TaskRecurrencyInput>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type TasksConnection = {
  __typename?: 'TasksConnection';
  items: Array<TaskSchema>;
  meta: CursorPaginationMeta;
};

export type TasksPerPageConnection = {
  __typename?: 'TasksPerPageConnection';
  items: Array<TaskSchema>;
  meta: TasksPerPageMeta;
};

export type TasksPerPageMeta = {
  __typename?: 'TasksPerPageMeta';
  nextPage: Scalars['Boolean']['output'];
};
