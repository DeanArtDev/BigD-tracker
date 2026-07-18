'use client';

import { isEmpty } from 'lodash-es';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import z from 'zod';

type UrlParamsSchema = z.ZodObject<{ [key: string]: z.ZodType }>;

function useAppParams<TSchema extends UrlParamsSchema = UrlParamsSchema>(
  schema: TSchema,
): z.infer<TSchema> | undefined {
  const params = useParams();

  return useMemo(() => {
    const parsed = schema.safeParse(params);
    return parsed.success && !isEmpty(parsed.data) ? parsed.data : undefined;
  }, [params, schema]);
}

export { useAppParams };
