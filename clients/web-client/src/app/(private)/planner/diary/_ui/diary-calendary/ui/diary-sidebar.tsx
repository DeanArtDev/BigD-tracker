import { type ICalendarApp, LocaleProvider, MiniCalendar } from '@dayflow/core';
import { type CalendarSidebarRenderProps } from '@dayflow/plugin-sidebar';
import { Eye, EyeOff, PanelLeftClose, PanelLeftOpen, Ungroup } from 'lucide-react';
import { h, render } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'react';
import timeAndDate from '@/shared/lib/time';
import { AppTooltip } from '@/shared/project-ui';
import {
  Button,
  cn,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '@/shared/ui-kit';
import { EMPTY_GROUP_ID } from '../model';

const DIARY_SIDEBAR_MINI_WIDTH = '50px';

function DiarySidebar(props: CalendarSidebarRenderProps) {
  const { app, calendars, toggleAll, toggleCalendarVisibility, isCollapsed, setCollapsed, showEventDots } = props;
  const allCalendarsVisible = calendars.every((calendar) => calendar.isVisible !== false);
  const toggleAllLabel = allCalendarsVisible ? 'Скрыть' : 'Показать';

  const isOnlyOneGroup = calendars.length <= 1;

  return (
    <aside
      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground"
      style={{ width: isCollapsed ? DIARY_SIDEBAR_MINI_WIDTH : '100%' }}
    >
      <header
        className={cn(
          'flex min-h-10 items-center py-1',
          isCollapsed ? 'flex-col justify-center gap-1 px-1' : 'justify-between px-2',
        )}
      >
        {!isCollapsed && !isOnlyOneGroup && (
          <AppTooltip side="right" content={toggleAllLabel}>
            <Button
              aria-label={toggleAllLabel}
              className={cn('shrink-0', isCollapsed && 'mx-auto')}
              onClick={() => toggleAll(!allCalendarsVisible)}
              size={isCollapsed ? 'icon' : 'default'}
              type="button"
              variant={isCollapsed ? 'ghost' : 'ghost'}
            >
              {allCalendarsVisible ? <EyeOff /> : <Eye />}
            </Button>
          </AppTooltip>
        )}

        <Button
          aria-label={isCollapsed ? 'Развернуть список календарей' : 'Свернуть список календарей'}
          className={cn('shrink-0', isCollapsed ? 'mx-auto' : 'ml-auto')}
          onClick={() => setCollapsed(!isCollapsed)}
          size="icon-sm"
          title={isCollapsed ? 'Развернуть список календарей' : 'Свернуть список календарей'}
          type="button"
          variant="ghost"
        >
          {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </header>

      {!isOnlyOneGroup && (
        <SidebarContent>
          <SidebarGroup className={cn(isCollapsed && 'p-1')}>
            {!isCollapsed && <SidebarGroupLabel>Группы</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {calendars.map((calendar) => {
                  const isVisible = calendar.isVisible !== false;
                  const isGroupFree = calendar.id === EMPTY_GROUP_ID;

                  return (
                    <SidebarMenuItem className={cn(isCollapsed && 'flex justify-center')} key={calendar.id}>
                      <AppTooltip skip={!isCollapsed} side="right" content={calendar.name}>
                        <Button
                          aria-checked={isVisible}
                          aria-label={`${isVisible ? 'Скрыть' : 'Показать'} группы ${calendar.name}`}
                          className={cn(
                            'h-8 w-full justify-start gap-2 overflow-hidden px-2 font-normal',
                            isCollapsed && 'size-8 justify-center p-0',
                          )}
                          onClick={() => toggleCalendarVisibility(calendar.id, !isVisible)}
                          role="checkbox"
                          variant="ghost"
                        >
                          {calendar.icon ? (
                            <span
                              aria-hidden="true"
                              className={cn(
                                'flex size-5 shrink-0 items-center justify-center rounded-full text-xs transition-opacity',
                                !isVisible && 'opacity-30',
                              )}
                              style={{ backgroundColor: calendar.colors.lineColor }}
                            >
                              {calendar.icon}
                            </span>
                          ) : isGroupFree ? (
                            <Ungroup
                              className={cn(
                                'size-4 shrink-0 rounded-full transition-opacity',
                                !isVisible && 'opacity-30',
                              )}
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className={cn(
                                'size-3 shrink-0 rounded-full transition-opacity',
                                !isVisible && 'opacity-30',
                              )}
                              style={{ backgroundColor: calendar.colors.lineColor }}
                            />
                          )}

                          {!isCollapsed && (
                            <span className={cn('truncate', !isVisible && 'text-muted-foreground')}>
                              {calendar.name}
                            </span>
                          )}
                        </Button>
                      </AppTooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      )}

      {!isCollapsed && (
        <div className="df-sidebar-mini-calendar mt-auto shrink-0">
          <DiaryMiniCalendar app={app} showEventDots={showEventDots} />
        </div>
      )}
    </aside>
  );
}

interface DiaryMiniCalendarProps {
  readonly app: ICalendarApp;
  readonly showEventDots?: boolean;
}

function DiaryMiniCalendar({ app, showEventDots }: DiaryMiniCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const viewConfig = app.getViewConfig(app.state.currentView);
    const timeZone = typeof viewConfig.secondaryTimeZone === 'string' ? viewConfig.secondaryTimeZone : undefined;

    render(
      h(
        LocaleProvider,
        { locale: app.state.locale },
        h(MiniCalendar, {
          calendarRegistry: app.getCalendarRegistry(),
          currentDate: app.getCurrentDate(),
          events: app.getEvents(),
          onDateSelect: (date) => app.setCurrentDate(date),
          onMonthChange: (offset) => {
            const current = app.getVisibleMonth();
            app.setVisibleMonth(timeAndDate(current).add(offset, 'month').toDate());
          },
          showEventDots,
          showHeader: true,
          timeZone,
          visibleMonth: app.getVisibleMonth(),
        }),
      ),
      container,
    );
  });

  useEffect(() => {
    const container = containerRef.current;

    return () => {
      if (container) render(null, container);
    };
  }, []);

  return <div ref={containerRef} />;
}

export { DIARY_SIDEBAR_MINI_WIDTH, DiarySidebar };
