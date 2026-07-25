import { DataEmptyElement } from './data-empty-element';
import { DataErrorElement } from './data-error-element';
import { DataLoaderRoot, type DataLoaderRootProps } from './data-loader-root';
import { DataLoadingElement } from './data-loading-element';
import { LoadingStatus, useLoadingStatus } from './data-loading-status-element';

const DataLoader = Object.assign(DataLoaderRoot, {
  Empty: DataEmptyElement,
  Error: DataErrorElement,
  Loading: DataLoadingElement,
  StatusLoading: LoadingStatus,
});

type DataLoaderProps = DataLoaderRootProps;

export { DataLoader, type DataLoaderProps, useLoadingStatus };
