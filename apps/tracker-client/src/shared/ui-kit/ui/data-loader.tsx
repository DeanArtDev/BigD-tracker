import { type PropsWithChildren, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { LoaderCircle } from 'lucide-react';

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
    loadingElement = (
      <LoaderCircle color="#8e51ff" className="animate-spin m-auto" size={70} />
    ),

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
        children
      )}
    </>
  );
}

export { DataLoader, type DataLoaderProps };
