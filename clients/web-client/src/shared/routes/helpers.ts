import { compile, ParamData } from 'path-to-regexp';
import qs from 'qs';
import { type UrlQueryParams } from './types';

type UrlParams = ParamData;

interface UrlBuilderOptions {
  readonly urlParams?: UrlParams;
  readonly queryObject?: UrlQueryParams;
}

function buildLink(path: string, options: UrlBuilderOptions = {}) {
  const { urlParams, queryObject } = options;
  const toPath = compile(path);

  return `${toPath(urlParams)}${qs.stringify(queryObject, {
    addQueryPrefix: true,
  })}`;
}

export { buildLink };
