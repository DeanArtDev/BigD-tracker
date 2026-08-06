import { notFound } from 'next/navigation';
import { z } from 'zod';
import { withValidatedUrlData } from '@/shared/lib/url';
import { diaryUrlSchema } from './_model';
import { DiaryGroupsPrefetch } from './_prefetches/diary-groups.prefetch';
import { DiaryTasksPrefetch } from './_prefetches/diary-tasks.prefetch';
import { DiaryPageContent } from './_ui/diary-page-content';

function Component({ searchParams }: { searchParams?: z.infer<typeof diaryUrlSchema> }) {
  const input =
    searchParams?.from != null && searchParams?.to != null
      ? { from: searchParams.from, to: searchParams.to }
      : undefined;

  return (
    <DiaryGroupsPrefetch>
      <DiaryTasksPrefetch view={searchParams?.view} input={input}>
        <DiaryPageContent />
      </DiaryTasksPrefetch>
    </DiaryGroupsPrefetch>
  );
}

const DiaryPage = withValidatedUrlData({ searchParams: diaryUrlSchema }, Component, notFound);
export default DiaryPage;
