import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export function GlobalErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    // это ответ из loader/action
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    // любое исключение
    return (
      <div>
        <h1>Ошибка</h1>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    // всё остальное
    return <h1>Неизвестная ошибка</h1>;
  }
}
