'use client';

import { ComponentType, useState } from 'react';

type ComponentModule<P = object> = {
  default: ComponentType<P>;
};
type LoaderComponent<P = object> = Promise<ComponentType<P> | ComponentModule<P>>;
type Loader<P = object> = () => LoaderComponent<P>;

interface UseLazyImportProps<P = object> {
  readonly loader: Loader<P>;
}

function useLazyImport<P = object>({ loader }: UseLazyImportProps<P>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [onlyOneLoad, setOnlyOneLoad] = useState(false);
  const [success, setSuccess] = useState(false);

  const [Component, setComponent] = useState<ComponentType<P>>(() => () => null);

  const loadModule = async () => {
    if (success || onlyOneLoad) return;

    try {
      setLoading(true);
      setOnlyOneLoad(true);

      const result = await loader();
      if ('default' in result) {
        setComponent(() => result.default);
      } else {
        setComponent(() => result);
      }
      setSuccess(true);
    } catch (e) {
      if (e instanceof Error) setError(e);
      setSuccess(false);
      setOnlyOneLoad(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    Component,
    loadModule,
  };
}

export { useLazyImport, type UseLazyImportProps };
