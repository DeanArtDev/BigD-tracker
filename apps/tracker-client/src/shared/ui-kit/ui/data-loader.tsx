import { type PropsWithChildren, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { AppLoader } from './app-loader';

interface DataLoaderProps extends PropsWithChildren {
  readonly isLoading?: boolean;
  readonly loadingElement?: ReactNode;

  readonly isEmpty?: boolean;
  readonly emptyElement?: ReactNode;

  readonly isError?: boolean;
  readonly errorElement?: ReactNode;

  readonly parallelMount?: boolean;
}

function DataLoader(props: DataLoaderProps) {
  const {
    isEmpty = false,
    isError = false,
    isLoading = false,

    parallelMount = false,

    emptyElement = 'Пусто',
    errorElement = 'Ошибка',
    loadingElement = <AppLoader />,

    children,
  } = props;

  const readyToShow = !isLoading && !isEmpty && !isError;
  const renderLoadingElement = isLoading && !isError;
  const renderEmptyElement = isEmpty && !isLoading && !isError;

  return (
    <>
      {isError && errorElement}

      {renderLoadingElement && loadingElement}

      {renderEmptyElement && emptyElement}

      {parallelMount ? (
        <div className={clsx({ contents: readyToShow })}>{children}</div>
      ) : (
        readyToShow && children
      )}
    </>
  );
}

export { DataLoader, type DataLoaderProps };
