'use client';

import { clipboardStore, type Event, ViewType } from '@dayflow/core';
import { Check, Copy, Folder, Scissors, Trash2 } from 'lucide-react';
import { type RefObject, useEffect, useRef, useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/shared/ui-kit';
import { useDiaryContext } from '../context';

interface DiaryEventContextMenuProps {
  readonly containerRef: RefObject<HTMLElement | null>;
}

function DiaryEventContextMenu({ containerRef }: DiaryEventContextMenuProps) {
  const { calendar } = useDiaryContext();
  const app = calendar.app;

  const triggerRef = useRef<HTMLSpanElement>(null);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContextMenu = (contextMenuEvent: MouseEvent) => {
      const target = contextMenuEvent.target;
      if (!(target instanceof Element)) return;

      const eventElement = target.closest<HTMLElement>('[data-event-id]');
      if (!eventElement || !container.contains(eventElement)) return;

      const calendarEvent = app.getEvents().find(({ id }) => id === eventElement.dataset.eventId);
      if (!calendarEvent || !app.canMutateFromUI(calendarEvent.id)) return;

      contextMenuEvent.preventDefault();
      contextMenuEvent.stopPropagation();
      setEvent(calendarEvent);
      app.selectEvent(calendarEvent.id);

      const eventRect = eventElement.getBoundingClientRect();
      const clientX = contextMenuEvent.clientX || eventRect.left + eventRect.width / 2;
      const clientY = contextMenuEvent.clientY || eventRect.top + eventRect.height / 2;

      window.requestAnimationFrame(() => {
        triggerRef.current?.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
          }),
        );
      });
    };

    container.addEventListener('contextmenu', handleContextMenu, true);
    return () => container.removeEventListener('contextmenu', handleContextMenu, true);
  }, [app, containerRef]);

  const copyEvent = async (cut: boolean) => {
    if (!event) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(event, null, 2));
      clipboardStore.setEvent(event);
      if (cut) await app.deleteEvent(event.id);
    } catch (error) {
      console.error(`Failed to ${cut ? 'cut' : 'copy'} event`, error);
    }
  };

  return (
    <ContextMenu onOpenChange={(open) => !open && setEvent(null)}>
      <ContextMenuTrigger ref={triggerRef} className="pointer-events-none fixed size-px opacity-0" />

      {event && (
        <ContextMenuContent className="min-w-52">
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Folder />
              Переместить в группу
            </ContextMenuSubTrigger>

            <ContextMenuSubContent className="max-h-100 min-w-48 overflow-y-auto">
              {app.getCalendars().map((calendar) => (
                <ContextMenuItem
                  key={calendar.id}
                  onSelect={() => void app.updateEvent(event.id, { calendarId: calendar.id })}
                >
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: calendar.colors.lineColor }}
                  />
                  <span className="min-w-0 flex-1 truncate">{calendar.name}</span>
                  {calendar.id === event.calendarId && <Check className="ml-auto" />}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          <ContextMenuItem onSelect={() => void copyEvent(false)}>
            <Copy />
            Копировать
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => void copyEvent(true)}>
            <Scissors />
            Вырезать
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem variant="destructive" onSelect={() => void app.deleteEvent(event.id)}>
            <Trash2 />
            Удалить
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}

export { DiaryEventContextMenu };
