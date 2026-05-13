import { sessionsCombinators } from './init';

const { leaf } = sessionsCombinators;

const SessionByUserId = (userId: number) =>
  leaf({
    key: 'SessionByUserId',
    purpose: 'filter',
    toExpr: (eb) => eb('sessions.user_id', '=', userId),
  });

const SessionById = (id: number) =>
  leaf({
    key: 'SessionById',
    purpose: 'filter',
    toExpr: (eb) => eb('sessions.id', '=', id),
  });

export { SessionByUserId, SessionById };
