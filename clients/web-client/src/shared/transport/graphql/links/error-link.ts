import { ErrorLink } from '@apollo/client/link/error';
import { throwError } from 'rxjs';
import { fromApolloError } from '../exceptions';

const errorLink = new ErrorLink(({ error }) => {
  const [apiError] = fromApolloError(error);
  if (apiError != null) {
    return throwError(() => apiError);
  }
});

export { errorLink };
