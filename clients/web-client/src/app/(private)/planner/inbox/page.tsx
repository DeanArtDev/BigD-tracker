import { cookies } from 'next/headers';
import { z } from 'zod';
import { InboxPrefetcher } from '@/app/(private)/_prefetches';
import { inboxInitialRequestVariables } from '@/entity/planner/inbox';
import { withValidatedUrlData } from '@/shared/lib/url';
import { SIDEBAR_COOKIE_NAME } from '@/shared/ui-kit';
import { inboxUrlQuerySchema } from './_model/use-inbox-url-query';
import { InboxSidebar } from './_ui/inbox-sidebar';

const pageParamsSchema = {
  searchParams: inboxUrlQuerySchema,
};

async function Page({ searchParams }: { searchParams?: z.infer<typeof pageParamsSchema.searchParams> }) {
  const open = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value === 'true';

  return (
    <InboxPrefetcher
      variables={{
        ...inboxInitialRequestVariables,
        search: searchParams?.search,
        status: searchParams?.status,
        priority: searchParams?.priority?.map(Number),
      }}
    >
      <InboxSidebar open={open} />
    </InboxPrefetcher>
  );
}

const InboxPage = withValidatedUrlData(pageParamsSchema, Page);
export default InboxPage;
