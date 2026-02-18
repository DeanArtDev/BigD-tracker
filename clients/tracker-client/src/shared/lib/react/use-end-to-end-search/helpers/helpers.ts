import { isEmpty } from 'lodash-es';

function searchSubString(target: string, search: string) {
  return target.toLowerCase().includes(search.toLowerCase().trim());
}

function isStringIncludesSearch(str?: string, search?: string | null): boolean {
  if (str == null || isEmpty(str) || search == null || isEmpty(search)) return false;
  return searchSubString(str, search);
}

function isNumberIncludesSearch(num?: number, search?: string | null): boolean {
  return isStringIncludesSearch(num?.toString(), search);
}

export { searchSubString, isStringIncludesSearch, isNumberIncludesSearch };
