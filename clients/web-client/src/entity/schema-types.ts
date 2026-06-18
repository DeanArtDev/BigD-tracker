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

export type GetInboxMeta = {
  __typename?: 'GetInboxMeta';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type GetInboxResponse = {
  __typename?: 'GetInboxResponse';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  taskCount: Scalars['Float']['output'];
  tasks: TasksConnection;
};

export type GetInboxResponseTasksArgs = {
  input?: InputMaybe<GetInboxTasksInput>;
};

export type GetInboxTasksInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Float']['input'];
  priority?: InputMaybe<Array<Scalars['Float']['input']>>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<TaskStatus>>;
};

export type GetPlannerInit = {
  __typename?: 'GetPlannerInit';
  inboxId: Scalars['Int']['output'];
  inboxTaskCount: Scalars['Int']['output'];
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
  /** Выход пользователя из системы на одном устройстве */
  createTask: TaskSchema;
  /** Выход пользователя из системы на одном устройстве */
  deleteTask: TaskSchema;
  /** Продление токена сессии, необходимы access и refresh токены одновременно */
  refresh: Scalars['Boolean']['output'];
  /** Логин по email/паролю. Выставляет httpOnly cookies access/refresh. */
  userLogin: Scalars['Boolean']['output'];
  /** Выход пользователя из системы на одном устройстве */
  userLogout: Scalars['Boolean']['output'];
};

export type MutationCreateTaskArgs = {
  input: TaskCreateInput;
};

export type MutationDeleteTaskArgs = {
  input: TaskDeleteInput;
};

export type MutationUserLoginArgs = {
  input: LoginUserInput;
};

export type Query = {
  __typename?: 'Query';
  getInbox: GetInboxResponse;
  getPlannerInit: GetPlannerInit;
  me: MeRes;
};

export type TaskCreateInput = {
  deadline?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  priority: Scalars['Float']['input'];
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type TaskDeleteInput = {
  id: Scalars['String']['input'];
};

/** Дело */
export type TaskSchema = {
  __typename?: 'TaskSchema';
  cancelReason?: Maybe<Scalars['String']['output']>;
  deadline?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  groupId?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  priority: Scalars['Float']['output'];
  startDate?: Maybe<Scalars['String']['output']>;
  status: TaskStatus;
  userId: Scalars['Float']['output'];
  weight: Scalars['Float']['output'];
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

export type TasksConnection = {
  __typename?: 'TasksConnection';
  items: Array<TaskSchema>;
  meta: GetInboxMeta;
};
