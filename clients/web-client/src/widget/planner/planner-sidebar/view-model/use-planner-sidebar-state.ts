'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const PLANNER_SIDEBAR_STORAGE_KEY = 'planner-sidebar-state';

interface PlannerSidebarStore {
  readonly open: boolean | undefined;
  readonly setOpen: (open: boolean) => void;
}

const usePlannerSidebarStore = create<PlannerSidebarStore>()(
  persist(
    (set) => ({
      open: undefined,
      setOpen: (open) => {
        set({ open });
      },
    }),
    {
      name: PLANNER_SIDEBAR_STORAGE_KEY,
      partialize: ({ open }) => ({ open }),
    },
  ),
);

function usePlannerSidebarState(defaultOpen?: boolean): PlannerSidebarStore {
  const open = usePlannerSidebarStore((state) => state.open);
  const setOpen = usePlannerSidebarStore((state) => state.setOpen);
  return {
    open: open ?? defaultOpen,
    setOpen,
  };
}

export { usePlannerSidebarState };
