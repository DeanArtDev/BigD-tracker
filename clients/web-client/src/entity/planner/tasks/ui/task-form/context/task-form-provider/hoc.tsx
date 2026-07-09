'use client';

import { FunctionComponent } from 'react';
import { TaskFormProvider } from './task-form.provider';

function withTaskFormProvider<TProps extends Record<string, unknown>>(WrappedComponent: FunctionComponent<TProps>) {
  const displayName = WrappedComponent?.displayName ?? WrappedComponent?.name ?? 'Component';

  function ComponentWithTaskFormProvider(props: TProps) {
    return (
      <TaskFormProvider>
        <WrappedComponent {...props} />
      </TaskFormProvider>
    );
  }
  ComponentWithTaskFormProvider.displayName = `WithTaskFormProvider${displayName}`;

  return ComponentWithTaskFormProvider;
}

export { withTaskFormProvider };
