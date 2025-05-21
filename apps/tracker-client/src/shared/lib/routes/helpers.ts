import qs from 'qs';
import { generatePath } from 'react-router-dom';
import { type UrlQueryParams } from './types';

type UrlParams = Record<string, string | number>;

interface UrlBuilderOptions {
  readonly urlParams?: UrlParams;
  readonly queryObject?: UrlQueryParams;
}

function buildLink(path: string, options: UrlBuilderOptions = {}) {
  const { urlParams, queryObject } = options;

  return `${generatePath(path, urlParams)}${qs.stringify(queryObject, {
    addQueryPrefix: true,
  })}`;
}

export { buildLink };
