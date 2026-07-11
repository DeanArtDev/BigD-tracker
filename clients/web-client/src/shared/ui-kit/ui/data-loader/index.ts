import { DataEmptyElement } from './data-empty-element';
import { DataErrorElement } from './data-error-element';
import { DataLoaderRoot, type DataLoaderRootProps } from './data-loader-root';
import { DataLoadingElement } from './data-loading-element';

const DataLoader = Object.assign(DataLoaderRoot, {
  Empty: DataEmptyElement,
  Error: DataErrorElement,
  Loading: DataLoadingElement,
});

type DataLoaderProps = DataLoaderRootProps;

export { DataLoader, type DataLoaderProps };
