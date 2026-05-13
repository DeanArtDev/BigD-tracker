import { usersCombinators } from './init';

const { leaf } = usersCombinators;

const UserById = (userId: number) =>
  leaf({
    key: 'UserById',
    purpose: 'filter',
    toExpr: (eb) => eb('users.id', '=', userId),
  });

const UserByEmail = (email: string) =>
  leaf({
    key: 'UserByEmail',
    purpose: 'filter',
    toExpr: (eb) => eb('users.email', '=', email),
  });

export { UserById, UserByEmail };
