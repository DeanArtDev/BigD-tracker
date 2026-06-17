import { cookies } from 'next/headers';
import { z } from 'zod';
import { InboxPrefetcher } from '@/app/(private)/_prefetches';
import { InboxPageWrapper } from '@/app/(private)/planner/inbox/_ui/inbox-page-wrapper';
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
    <InboxSidebar
      open={open}
      content={
        <InboxPrefetcher
          variables={{
            ...inboxInitialRequestVariables,
            search: searchParams?.search,
            status: searchParams?.status,
            priority: searchParams?.priority?.map(Number),
          }}
        >
          <InboxPageWrapper />
        </InboxPrefetcher>
      }
    />
  );
}

const InboxPage = withValidatedUrlData(pageParamsSchema, Page);
export default InboxPage;
