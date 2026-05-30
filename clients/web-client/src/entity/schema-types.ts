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
};

export type MutationUserLoginArgs = {
  input: LoginUserInput;
};

export type Query = {
  __typename?: 'Query';
  me: MeRes;
};
