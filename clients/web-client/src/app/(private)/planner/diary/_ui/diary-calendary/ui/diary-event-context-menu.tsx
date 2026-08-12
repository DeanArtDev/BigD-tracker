'use client';

import type { Event } from '@dayflow/core';
import { Check, Copy, Folder, Scissors, Trash2 } from 'lucide-react';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskActionType, TaskDomain, TaskType } from '@/entity/planner/tasks';
import { useTaskAssignToGroupFeature } from '@/feature/planner/task-assign-to-group';
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
import { useDiaryContext, useDiaryCutCopyPasteContext } from '../context';
import { DiaryEventDomain, EMPTY_GROUP_ID } from '../model';

interface DiaryEventContextMenuProps {
  readonly containerRef: RefObject<HTMLElement | null>;
}

function isDeleteAllowed(event: Event) {
  const task = DiaryEventDomain.mapEventToTask(DiaryEventDomain.withTaskMeta(event));
  if (task.id == null) return false;

  return TaskDomain.isAllowTaskAction(TaskActionType.Delete, task.status, TaskDomain.parseId(task.id).type);
}

function DiaryEventContextMenu({ containerRef }: DiaryEventContextMenuProps) {
  const { calendar } = useDiaryContext();
  const { assignToGroup } = useTaskAssignToGroupFeature();
  const { copyEvent, cutEvent } = useDiaryCutCopyPasteContext();
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
      if (calendarEvent.meta?.loading === true) {
        contextMenuEvent.preventDefault();
        contextMenuEvent.stopPropagation();
        contextMenuEvent.stopImmediatePropagation();
        return;
      }

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

  const moveEventToGroup = async (newCalendarId: string) => {
    if (!event || event.calendarId === newCalendarId) return;

    const task = DiaryEventDomain.mapEventToTask(DiaryEventDomain.withTaskMeta(event));
    const groupId = DiaryEventDomain.mapCalendarIdToGroupId(newCalendarId);
    if (task.id == null || groupId == null) return;

    const idToUpdateSet = new Set([event.id]);

    const idData = TaskDomain.parseId(task.id);
    if (idData.type === TaskType.Virtual || idData.type === TaskType.Override) {
      const recurrenceId = idData.data.recurrenceId;
      app.getAllEvents().forEach((event) => {
        const t = DiaryEventDomain.mapEventToTask(DiaryEventDomain.withTaskMeta(event));
        if (t.id == null) return;
        const parsedId = TaskDomain.parseId(t.id);
        if (parsedId.type === TaskType.Virtual || parsedId.type === TaskType.Override) {
          if (parsedId.data.recurrenceId === recurrenceId) idToUpdateSet.add(event.id);
        }
      });
    }

    app.applyEventsChanges(
      {
        update: Array.from(idToUpdateSet).map((id) => ({ id: id, updates: { calendarId: newCalendarId } })),
      },
      false,
      'remote',
    );

    try {
      await assignToGroup(
        {
          groupId,
          task: {
            id: task.id,
            groupId: task.groupId,
          },
        },
        { showToast: false },
      );
    } catch {
      const previousCalendarId = event.calendarId;
      app.applyEventsChanges(
        {
          update: Array.from(idToUpdateSet).map((id) => ({ id: id, updates: { calendarId: previousCalendarId } })),
        },
        false,
        'remote',
      );
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
              {app
                .getCalendars()
                .filter((calendar) => calendar.id !== EMPTY_GROUP_ID)
                .map((calendar) => (
                  <ContextMenuItem key={calendar.id} onSelect={() => void moveEventToGroup(calendar.id)}>
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

          <ContextMenuItem onSelect={() => void copyEvent(event)}>
            <Copy />
            Копировать
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => void cutEvent(event)}>
            <Scissors />
            Вырезать
          </ContextMenuItem>

          {isDeleteAllowed(event) && (
            <>
              <ContextMenuSeparator />

              <ContextMenuItem
                variant="destructive"
                onSelect={() => void app.deleteEvent(event.id).catch(() => undefined)}
              >
                <Trash2 />
                Удалить
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}

export { DiaryEventContextMenu };
