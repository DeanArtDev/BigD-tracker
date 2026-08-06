import { type CalendarSidebarRenderProps } from '@dayflow/plugin-sidebar';
import { Eye, EyeOff, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { AppTooltip } from '@/shared/project-ui';
import { useGetDiaryGroupList } from '@/shared/transport/graphql';
import {
  Button,
  cn,
  DataLoader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSkeleton,
} from '@/shared/ui-kit';
import { DiaryMenuItem } from './diary-menu-item';
import { DiarySidebarContextMenu } from './diary-sidebar-context-menu';
import { DiaryMiniCalendar } from './mini-calendar';
import { EMPTY_GROUP_ID } from '../../model';

const DIARY_SIDEBAR_MINI_WIDTH = '50px';
const DIARY_SIDEBAR_SKELETON_ITEMS = 32;

function DiarySidebar(props: CalendarSidebarRenderProps) {
  const { app, calendars, toggleAll, toggleCalendarVisibility, isCollapsed, setCollapsed, showEventDots } = props;
  const allCalendarsVisible = calendars.every((calendar) => calendar.isVisible !== false);
  const { loading } = useGetDiaryGroupList();
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

      {(loading || !isOnlyOneGroup) && (
        <SidebarContent className={cn(loading && 'overflow-hidden')}>
          <SidebarGroup className={cn(isCollapsed && 'p-1')}>
            {!isCollapsed && <SidebarGroupLabel>Группы</SidebarGroupLabel>}

            <SidebarGroupContent>
              <DiarySidebarContextMenu>
                <SidebarMenu className="gap-1">
                  <DataLoader isLoading={loading} loadingElement={<DiarySidebarSkeleton isCollapsed={isCollapsed} />}>
                    {calendars.map((calendar) => {
                      const isVisible = calendar.isVisible !== false;
                      const isGroupFree = calendar.id === EMPTY_GROUP_ID;

                      return (
                        <DiaryMenuItem
                          key={calendar.id}
                          groupId={calendar.id}
                          groupName={calendar.name}
                          isCollapsed={isCollapsed}
                          isVisible={isVisible}
                          isGroupFree={isGroupFree}
                          lineColor={calendar.colors.lineColor}
                          icon={calendar.icon}
                          onClick={() => toggleCalendarVisibility(calendar.id, !isVisible)}
                        />
                      );
                    })}
                  </DataLoader>
                </SidebarMenu>
              </DiarySidebarContextMenu>
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

function DiarySidebarSkeleton({ isCollapsed }: { readonly isCollapsed: boolean }) {
  return Array.from({ length: DIARY_SIDEBAR_SKELETON_ITEMS }, (_, index) => (
    <SidebarMenuSkeleton
      key={index}
      className={cn(
        isCollapsed &&
          'justify-center px-0 **:data-[sidebar=menu-skeleton-icon]:size-5 **:data-[sidebar=menu-skeleton-icon]:rounded-full [&_[data-sidebar=menu-skeleton-text]]:hidden',
      )}
      showIcon
    />
  ));
}

export { DIARY_SIDEBAR_MINI_WIDTH, DiarySidebar };
