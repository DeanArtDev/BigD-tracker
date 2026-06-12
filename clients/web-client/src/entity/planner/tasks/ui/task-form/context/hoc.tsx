'use client';

import { FunctionComponent } from 'react';
import { TaskFormProvider } from './task-form.provider';

function withTaskFormProvider<TProps extends Record<string, unknown>>(WrappedComponent: FunctionComponent<TProps>) {
  const displayName = WrappedComponent?.displayName ?? WrappedComponent?.name ?? 'Component';

  function ComponentWithNotification(props: TProps) {
    return (
      <TaskFormProvider>
        <WrappedComponent {...props} />
      </TaskFormProvider>
    );
  }
  ComponentWithNotification.displayName = `WithTaskFormProvider${displayName}`;

  return ComponentWithNotification;
}

export { withTaskFormProvider };
