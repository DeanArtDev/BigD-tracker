import { useDocumentTitle } from 'usehooks-ts';
import type { PropsWithChildren } from 'react';
import { cn } from '@/shared/ui-kit/utils';

function PageWrapper(props: PropsWithChildren<{ className?: string; fixContainer?: boolean; title?: string }>) {
  useDocumentTitle(props?.title ?? window.document.title, { preserveTitleOnUnmount: false });

  return (
    <div
      className={cn(
        'page-wrapper flex flex-col grow min-h-0 min-w-0 w-full p-2 lg:p-4 pt-0 lg:pt-0',
        {
          'xl:max-w-[1400px] mx-auto p-0 lg:p-0': props.fixContainer,
        },
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

export { PageWrapper };
