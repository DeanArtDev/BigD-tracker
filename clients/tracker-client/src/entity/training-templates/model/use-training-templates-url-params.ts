import { useUrlQuery } from '@/shared/lib/react/use-url-query';
import { z } from 'zod';

const schema = z.object({ my: z.coerce.boolean().optional() });

function useTrainingTemplatesUrlParams() {
  const [search, setSearch] = useUrlQuery(schema);

  return {
    isMy: Boolean(search?.my),
    search,
    setSearch: (data: z.infer<typeof schema>) =>
      data.my === true ? setSearch({ my: data.my }) : setSearch({ my: undefined }),
  };
}

export { useTrainingTemplatesUrlParams };
