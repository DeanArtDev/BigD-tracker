'use client';

import dynamic from 'next/dynamic';
import { ReactNode, useMemo, useRef, useState } from 'react';
import { useIsMounted } from '@/shared/lib/application-status';
import { AppDrawer } from '@/shared/project-ui';
import { DataLoadingElement } from '@/shared/ui-kit';
import {
  GroupListDrawerContext,
  groupListDrawerContext,
  OpenGroupListHandlerParams,
} from './group-list-drawer.context';

const GroupListLazy = dynamic(() => import('./group-list').then((m) => m.GroupList), {
  loading: ({ isLoading }) => (isLoading ? <DataLoadingElement /> : null),
  ssr: false,
});

function GroupListDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const consumerParams = useRef<OpenGroupListHandlerParams | null>(null);

  const value = useMemo<GroupListDrawerContext>(
    () => ({
      openGroupList: (params) => {
        consumerParams.current = params;
        setOpen(true);
      },
    }),
    [setOpen],
  );

  const isMounted = useIsMounted();
  if (!isMounted) return null;

  return (
    <groupListDrawerContext.Provider value={value}>
      {children}

      <AppDrawer
        className="sm:data-[vaul-drawer-direction=right]:max-w-[40vw] sm:data-[vaul-drawer-direction=right]:min-w-[30vw]"
        open={open}
        title="Выбор группы"
        content={
          <GroupListLazy
            selectedGroupIds={consumerParams.current?.selectedGroupIds}
            onAccept={async (selected) => {
              const s = selected.find(Boolean);
              if (s != null) {
                await consumerParams.current?.cb(s);
                setOpen(false);
              }
            }}
            onCancel={() => {
              setOpen(false);
              consumerParams.current = null;
            }}
          />
        }
      />
    </groupListDrawerContext.Provider>
  );
}

export { GroupListDrawerProvider };
