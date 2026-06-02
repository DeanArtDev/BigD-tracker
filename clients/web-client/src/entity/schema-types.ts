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

export type GetInboxResponse = {
  __typename?: 'GetInboxResponse';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tasks: Array<Maybe<TaskSchema>>;
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
  refresh: Scalars['Boolean']['output'];
  /** Логин по email/паролю. Выставляет httpOnly cookies access/refresh. */
  userLogin: Scalars['Boolean']['output'];
  /** Выход пользователя из системы на одном устройстве */
  userLogout: Scalars['Boolean']['output'];
};

export type MutationUserLoginArgs = {
  input: LoginUserInput;
};

export type Query = {
  __typename?: 'Query';
  getInbox: GetInboxResponse;
  me: MeRes;
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
