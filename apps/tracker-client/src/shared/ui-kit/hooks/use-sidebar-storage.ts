import { SIDEBAR_COOKIE_NAME } from '@/shared/ui-kit/ui/sidebar';
import { create } from 'zustand/index';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  [SIDEBAR_COOKIE_NAME]: boolean;
  setSidebarState: (value: boolean) => void;
  toggleSidebarState: () => void;
}

const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      [SIDEBAR_COOKIE_NAME]: false,
      setSidebarState: (value) => {
        void set((state) => ({ ...state, [SIDEBAR_COOKIE_NAME]: value }));
      },
      toggleSidebarState: () => {
        void set((state) => {
          return {
            ...state,
            [SIDEBAR_COOKIE_NAME]: !state[SIDEBAR_COOKIE_NAME],
          };
        });
      },
    }),
    {
      name: SIDEBAR_COOKIE_NAME,
      partialize: (state) => ({ [SIDEBAR_COOKIE_NAME]: state[SIDEBAR_COOKIE_NAME] }),
    },
  ),
);

const setSidebarState = useSidebarStore.getState().setSidebarState;
const toggleSidebarState = useSidebarStore.getState().toggleSidebarState;

export { useSidebarStore, toggleSidebarState, setSidebarState };
