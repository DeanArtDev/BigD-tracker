import { createDragPlugin } from '@dayflow/plugin-drag';
import { createKeyboardShortcutsPlugin } from '@dayflow/plugin-keyboard-shortcuts';
import { createSidebarPlugin } from '@dayflow/plugin-sidebar';
import { useMemo } from 'react';
import { DIARY_SIDEBAR_MINI_WIDTH, DiarySidebar } from '../ui';

function usePlugins() {
  return useMemo(
    () => [
      createDragPlugin({
        onEventDrop: (updatedEvent) => {
          console.log('onEventDrop:', updatedEvent);
        },
        onEventResize: (updatedEvent) => {
          console.log('onEventResize:', updatedEvent);
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
          undo: (app) => void app.undo(),
          delete: (app, event) => {
            if (!event) return;
            app.deleteEvent(event.id);
            app.selectEvent(null);
          },
        },
      }),
    ],
    [],
  );
}

export { usePlugins };
