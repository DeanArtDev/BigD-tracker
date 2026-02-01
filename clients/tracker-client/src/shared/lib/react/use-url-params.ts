import { ZodType } from 'zod';
import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

function useUrlParams<TSchema extends ZodType>(schema: TSchema): z.infer<TSchema> | undefined {
  const params = useParams();

  return useMemo(() => {
    const parsed = schema.safeParse(params);
    return parsed.success && !isEmpty(parsed.data) ? parsed.data : undefined;
  }, [params, schema]);
}

export { useUrlParams };
