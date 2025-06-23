import { cn } from '@/shared/ui-kit/utils';
import { type PropsWithChildren, type ReactNode } from 'react';
import { AppLoader } from '../app-loader';
import './styles.css';

interface DataLoaderProps extends PropsWithChildren {
  readonly isLoading?: boolean;
  readonly loadingElement?: ReactNode;

  readonly isEmpty?: boolean;
  readonly emptyElement?: ReactNode;

  readonly isError?: boolean;
  readonly errorElement?: ReactNode;

  readonly blur?: boolean;
  readonly parallelMount?: boolean;

  readonly blurContainerClassName?: string;
}

function DataLoader(props: DataLoaderProps) {
  const {
    isEmpty = false,
    isError = false,
    isLoading = false,

    parallelMount = false,
    blur = false,

    emptyElement = 'Пусто',
    errorElement = 'Ошибка',
    loadingElement = <AppLoader />,

    blurContainerClassName,

    children,
  } = props;

  const readyToShow = !isLoading && !isEmpty && !isError;
  const renderLoadingElement = isLoading && !isError;
  const renderEmptyElement = isEmpty && !isLoading && !isError;

  if (blur) {
    if (!readyToShow) {
      return (
        <div className={cn('spinner-container contents', blurContainerClassName)}>
          {children}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            {loadingElement}
          </div>
        </div>
      );
    } else {
      return (
        <div className={cn('contents', blurContainerClassName)}>
          {children}
          <div className="overflow-hidden" />
        </div>
      );
    }
  }

  return (
    <>
      {isError && errorElement}

      {renderLoadingElement && loadingElement}

      {renderEmptyElement && emptyElement}

      {parallelMount ? (
        <div className={cn({ contents: readyToShow, hidden: !readyToShow })}>{children}</div>
      ) : (
        readyToShow && children
      )}
    </>
  );
}

export { DataLoader, type DataLoaderProps };
