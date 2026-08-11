import { ICalendarApp } from '@dayflow/core';
import { createDragPlugin } from '@dayflow/plugin-drag';
import { createKeyboardShortcutsPlugin } from '@dayflow/plugin-keyboard-shortcuts';
import { createSidebarPlugin } from '@dayflow/plugin-sidebar';
import { noop } from 'lodash-es';
import { useMemo } from 'react';
import { DIARY_SIDEBAR_MINI_WIDTH, DiarySidebar } from '../ui';
import { useEventUpdate } from './callbacks/use-event-update';

interface UsePluginsParams {
  readonly getApp: () => ICalendarApp | undefined;
}

function usePlugins({ getApp }: UsePluginsParams) {
  const { persistEventUpdate } = useEventUpdate({ getApp });

  return useMemo(
    () => [
      createDragPlugin({
        onEventDrop: async (updatedEvent, originEvent) => {
          const app = getApp();
          if (app == null) return;
          await persistEventUpdate(updatedEvent, originEvent);
        },
        onEventResize: async (updatedEvent, originEvent) => {
          const app = getApp();
          if (app == null) return;
          await persistEventUpdate(updatedEvent, originEvent);
        },
      }),

      createSidebarPlugin({
        createCalendarMode: 'modal',
        initialCollapsed: true,
        miniWidth: DIARY_SIDEBAR_MINI_WIDTH,
        showEventDots: true,
        render: (props) => <DiarySidebar {...props} />,
      }),

      createKeyboardShortcutsPlugin({
        callbacks: {
          undo: noop,
          delete: (app, event) => {
            if (!event) return;
            void app
              .deleteEvent(event.id)
              .then(() => app.selectEvent(null))
              .catch(() => undefined);
          },
        },
      }),
    ],
    [getApp, persistEventUpdate],
  );
}

export { usePlugins };
