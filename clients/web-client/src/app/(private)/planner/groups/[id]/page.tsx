import { notFound } from 'next/navigation';
import { z } from 'zod';
import { withValidatedUrlData } from '@/shared/lib/url';
import { GroupByIdPrefetch } from './_prefetches/group-by-id.prefetch';
import { GroupPageContent } from './_ui/group-page-content';
import { groupByIdPageSchema } from '../_lib/constants';

async function Component({ params }: { params: z.infer<typeof groupByIdPageSchema.params> }) {
  const { id } = params;

  return (
    <GroupByIdPrefetch groupId={id}>
      <GroupPageContent groupId={id} />
    </GroupByIdPrefetch>
  );
}

const GroupByIdPage = withValidatedUrlData(groupByIdPageSchema, Component, notFound);
export default GroupByIdPage;
