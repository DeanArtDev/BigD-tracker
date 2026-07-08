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

export type GetGroupInput = {
  groupId: Scalars['Int']['input'];
};

export type GetGroupListInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
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
  taskCount: Scalars['Int']['output'];
  tasks: TasksConnection;
};

export type GetInboxResponseTasksArgs = {
  input?: InputMaybe<GetInboxTasksInput>;
};

export type GetInboxTasksInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Int']['input'];
  priority?: InputMaybe<Array<Scalars['Int']['input']>>;
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

export type GetTasksInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  groupIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  limit: Scalars['Int']['input'];
  priority?: InputMaybe<Array<Scalars['Int']['input']>>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<TaskStatus>>;
};

export type GroupCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type GroupDeleteInput = {
  groupId: Scalars['Int']['input'];
};

export type GroupInfoDto = {
  __typename?: 'GroupInfoDto';
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
  status: GroupStatus;
  tasks: TasksConnection;
  userId: Scalars['Int']['output'];
};

/** Группа */
export type GroupSchemaTasksArgs = {
  input?: InputMaybe<GetGroupTasksInput>;
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
  assignTaskToGroup: Scalars['Boolean']['output'];
  /** Полное удаление дела */
  completeDeleteTask: Scalars['Int']['output'];
  /** Копирование дела */
  copyTask: TaskSchema;
  /** Создание группы */
  createGroup: GroupSchema;
  /** Выход пользователя из системы на одном устройстве */
  createTask: TaskSchema;
  /** Выход пользователя из системы на одном устройстве */
  deleteTask: TaskSchema;
  /** Завершение дела */
  finishTask: TaskSchema;
  /** Удаление группы */
  groupDelete: Scalars['Boolean']['output'];
  /** Продление токена сессии, необходимы access и refresh токены одновременно */
  refresh: Scalars['Boolean']['output'];
  /** Восстановление дела */
  taskRecovery: Scalars['Int']['output'];
  /** Удалить дело из группы */
  unassignTaskToGroup: Scalars['Boolean']['output'];
  /** Редактирование группы */
  updateGroup: GroupSchema;
  /** Редактирование дела */
  updateTask: TaskSchema;
  /** Логин по email/паролю. Выставляет httpOnly cookies access/refresh. */
  userLogin: Scalars['Boolean']['output'];
  /** Выход пользователя из системы на одном устройстве */
  userLogout: Scalars['Boolean']['output'];
};

export type MutationAssignTaskToGroupArgs = {
  input: TaskAssignInput;
};

export type MutationCompleteDeleteTaskArgs = {
  input: TaskCompleteDeleteInput;
};

export type MutationCopyTaskArgs = {
  input: TaskCopyInput;
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

export type MutationUpdateTaskArgs = {
  input: TaskUpdateInput;
};

export type MutationUserLoginArgs = {
  input: LoginUserInput;
};

export type Query = {
  __typename?: 'Query';
  getAssignableGroups: Array<GroupInfoDto>;
  /** Получение группы */
  getGroup: GroupSchema;
  /** Получение списка групп */
  getGroupList: GroupsConnection;
  getInbox: GetInboxResponse;
  getPlannerInit: GetPlannerInit;
  /** Получение дела по id */
  getTaskById: TaskSchema;
  /** Получение списка дел */
  getTasks: TasksConnection;
  me: MeRes;
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

export type QueryGetTasksArgs = {
  input: GetTasksInput;
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

export type TaskAssignInput = {
  groupId: Scalars['Int']['input'];
  taskId: Scalars['String']['input'];
};

export type TaskCompleteDeleteInput = {
  id: Scalars['String']['input'];
};

export type TaskCopyInput = {
  id: Scalars['String']['input'];
};

export type TaskCreateInput = {
  deadline?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  priority: Scalars['Int']['input'];
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
  priority: Scalars['Int']['output'];
  startDate?: Maybe<Scalars['String']['output']>;
  status: TaskStatus;
  userId: Scalars['Int']['output'];
  weight: Scalars['Int']['output'];
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
  priority: Scalars['Int']['input'];
  recurrence?: InputMaybe<TaskRecurrencyInput>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  weight: Scalars['Int']['input'];
};

export type TasksConnection = {
  __typename?: 'TasksConnection';
  items: Array<TaskSchema>;
  meta: CursorPaginationMeta;
};
