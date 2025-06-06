import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

function RouterErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        Ошибка роутера
        <br />
        {JSON.stringify(error, null, 2)}
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div>
        Обычная ошибка
        <br />
        {JSON.stringify(error, null, 2)}
      </div>
    );
  }

  return <span>неизвестная ошибка</span>;
}

export { RouterErrorBoundary };
