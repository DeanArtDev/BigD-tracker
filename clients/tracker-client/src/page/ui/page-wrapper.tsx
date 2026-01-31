import { useDocumentTitle } from 'usehooks-ts';
import type { PropsWithChildren } from 'react';
import { cn } from '@/shared/ui-kit/utils';

function PageWrapper(props: PropsWithChildren<{ className?: string; title?: string }>) {
  useDocumentTitle(props?.title ?? window.document.title, { preserveTitleOnUnmount: false });

  return (
    <div className={cn('page-wrapper flex flex-col p-2 lg:p-4', props.className)}>
      {props.children}
    </div>
  );
}

export { PageWrapper };
