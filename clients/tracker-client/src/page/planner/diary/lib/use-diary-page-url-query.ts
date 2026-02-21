import { useUrlQuery } from '@/shared/lib/react/use-url-query';
import z from 'zod';

const diaryPageQuery = z.object({
  filter: z
    .object({
      group: z.array(z.coerce.number()).optional(),
    })
    .optional(),
});

function useDiaryPageUrlQuery() {
  const [pageQuery, setPageQuery] = useUrlQuery(diaryPageQuery);

  return {
    pageQuery,
    setPageQuery,
  };
}

export { useDiaryPageUrlQuery };
