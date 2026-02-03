import { useUrlQuery } from '@/shared/lib/react/use-url-query';
import { z } from 'zod';

const schema = z.object({ my: z.coerce.boolean().optional() });
type TSchema = z.infer<typeof schema>;

function useExerciseUrlParams() {
  const [search, setSearch] = useUrlQuery(schema);

  return {
    isMy: Boolean(search?.my),
    search,
    setSearch: (data: TSchema) =>
      data.my === true ? setSearch({ my: data.my }) : setSearch({ my: undefined }),
  };
}

export { useExerciseUrlParams };
