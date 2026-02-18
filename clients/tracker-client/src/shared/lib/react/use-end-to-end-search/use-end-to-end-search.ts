import { useEffect, useEffectEvent, useState, useTransition } from 'react';
import type {
  DefaultDataType,
  EndToEndSearchData,
  EndToEndSearchParams,
  SearchValues,
} from './types';

function useEndToEndSearch<T extends DefaultDataType = DefaultDataType>(
  params: EndToEndSearchParams<T>,
): EndToEndSearchData<T> {
  const { data, predicates } = params;

  const [searchValue, setSearchValue] = useState<SearchValues>(null);
  const [foundData, setFoundData] = useState<T[] | null>(null);

  const [isPending, startTransition] = useTransition();

  const predicatesEvent = useEffectEvent(() => predicates);
  useEffect(() => {
    const predicateList = predicatesEvent();

    startTransition(() => {
      setFoundData(() => {
        if (data == null || data.length <= 0) return null;
        if (searchValue == null || searchValue.trim() === '') return data;

        return data.filter((item) => {
          if (predicateList?.entity?.(item, searchValue)) return true;

          for (const itemKey in item) {
            const predicate = predicateList?.[itemKey];
            if (predicate == null) continue;
            if (predicate?.(item[itemKey], searchValue)) return true;
          }

          return false;
        });
      });
    });
  }, [searchValue, data]);

  return {
    searchValue,
    foundData: foundData ?? data,

    isPending,

    handleSearchChange: setSearchValue,
  };
}

export { useEndToEndSearch };
