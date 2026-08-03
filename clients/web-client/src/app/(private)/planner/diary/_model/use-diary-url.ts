import { ViewType } from '@dayflow/core';
import { z } from 'zod';
import { useUrlQuery } from '@/shared/lib/url';

const diaryUrlSchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  view: z.enum(ViewType).optional(),
});

type UseDiaryUrl = z.infer<typeof diaryUrlSchema>;

function useDiaryUrl() {
  const [value, setValue] = useUrlQuery(diaryUrlSchema);
  const v =
    value?.from != null && value?.to != null ? { from: value.from, to: value.to, view: value?.view } : undefined;
  return [v, setValue] as const;
}

export { useDiaryUrl, type UseDiaryUrl, diaryUrlSchema };
