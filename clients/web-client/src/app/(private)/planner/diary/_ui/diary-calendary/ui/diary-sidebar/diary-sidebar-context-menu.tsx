import { getCalendarColorsForHex } from '@dayflow/core';
import { Palette } from 'lucide-react';
import { type MouseEvent, PropsWithChildren, useState } from 'react';
import { createPortal } from 'react-dom';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/shared/ui-kit';
import { useDiaryContext } from '../../context';
import { EMPTY_GROUP_ID } from '../../model';
import { DiaryColorPicker } from '../diary-color-picker';

interface ColorPickerState {
  readonly calendarId: string;
  readonly left: number;
  readonly top: number;
  readonly currentColor: string;
}

function DiarySidebarContextMenu({ children }: PropsWithChildren) {
  const { calendar } = useDiaryContext();
  const app = calendar.app;

  const [contextMenuGroupId, setContextMenuGroupId] = useState<string | null>(null);
  const [contextMenuItemRect, setContextMenuItemRect] = useState<DOMRect | null>(null);
  const [colorPicker, setColorPicker] = useState<ColorPickerState | null>(null);

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const item = target.closest<HTMLElement>('[data-diary-sidebar-item-id]');
    if (item == null || !event.currentTarget.contains(item)) {
      event.preventDefault();
      setContextMenuGroupId(null);
      return;
    }

    if (item.dataset.diarySidebarItemId != EMPTY_GROUP_ID) {
      setContextMenuGroupId(item.dataset.diarySidebarItemId ?? null);
      setContextMenuItemRect(item.getBoundingClientRect());
    }
  };

  const handleOpenColorPicker = () => {
    if (contextMenuGroupId == null || contextMenuItemRect == null) return;

    const calendar = app.getCalendars().find(({ id }) => id === contextMenuGroupId);
    if (calendar == null) return;

    setColorPicker({
      calendarId: calendar.id,
      currentColor: calendar.colors.lineColor,
      left: contextMenuItemRect.left + 24,
      top: contextMenuItemRect.top + contextMenuItemRect.height / 2,
    });
  };

  const handleColorChange = (
    calendarId: string,
    colorSet: ReturnType<typeof getCalendarColorsForHex>,
    isPending?: boolean,
  ) => {
    app.updateCalendar(calendarId, colorSet, isPending);
  };

  const handleCloseColorPicker = () => {
    if (colorPicker == null) return;

    app.updateCalendar(colorPicker.calendarId, {});
    setColorPicker(null);
  };

  return (
    <div onContextMenu={handleContextMenu}>
      <ContextMenu onOpenChange={(open) => !open && setContextMenuGroupId(null)}>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

        {contextMenuGroupId != null && (
          <ContextMenuContent>
            <ContextMenuItem onSelect={handleOpenColorPicker}>
              <Palette />
              Изменить цвет
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>

      {colorPicker != null &&
        createPortal(
          <div className="df-sidebar-color-picker-layer" onMouseDown={handleCloseColorPicker}>
            <div
              className="df-sidebar-color-picker-anchor"
              style={{
                top: colorPicker.top,
                left: colorPicker.left,
                zIndex: 10002,
                transform: 'translate(40px, -50%)',
              }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="df-sidebar-color-picker-card">
                <DiaryColorPicker
                  color={colorPicker.currentColor}
                  onChange={(color, isPending) => {
                    setColorPicker((current) => (current == null ? null : { ...current, currentColor: color.hex }));
                    handleColorChange(colorPicker.calendarId, getCalendarColorsForHex(color.hex), isPending);
                  }}
                  onClose={handleCloseColorPicker}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export { DiarySidebarContextMenu };
