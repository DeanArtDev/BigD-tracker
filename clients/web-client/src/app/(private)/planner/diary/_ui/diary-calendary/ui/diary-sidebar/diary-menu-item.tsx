import { Ungroup } from 'lucide-react';
import { MouseEvent, ReactNode } from 'react';
import { AppTooltip } from '@/shared/project-ui';
import { Button, cn, SidebarMenuItem } from '@/shared/ui-kit';

interface DiaryMenuItemProps {
  readonly groupId: string;
  readonly groupName: string;
  readonly isCollapsed: boolean;
  readonly isVisible: boolean;
  readonly isGroupFree: boolean;

  readonly lineColor: string;
  readonly icon?: ReactNode;

  readonly onClick: (event: MouseEvent) => void;
}

function DiaryMenuItem({
  isCollapsed,
  groupId,
  icon,
  isGroupFree,
  lineColor,
  groupName,
  isVisible,
  onClick,
}: DiaryMenuItemProps) {
  return (
    <SidebarMenuItem
      data-diary-sidebar-item-id={groupId}
      className={cn(isCollapsed && 'flex justify-center')}
      key={groupId}
    >
      <AppTooltip skip={!isCollapsed} side="right" content={groupName} delayDuration={4000}>
        <Button
          aria-checked={isVisible}
          aria-label={`${isVisible ? 'Скрыть' : 'Показать'} группы ${groupName}`}
          className={cn(
            'h-8 w-full justify-start gap-2 overflow-hidden px-2 font-normal',
            isCollapsed && 'size-8 justify-center p-0',
          )}
          onClick={onClick}
          role="checkbox"
          variant="ghost"
        >
          {icon ? (
            <span
              aria-hidden="true"
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full text-xs transition-opacity',
                !isVisible && 'opacity-30',
              )}
              style={{ backgroundColor: lineColor }}
            >
              {icon}
            </span>
          ) : isGroupFree ? (
            <Ungroup className={cn('size-4 shrink-0 rounded-full transition-opacity', !isVisible && 'opacity-30')} />
          ) : (
            <span
              aria-hidden="true"
              className={cn('size-3 shrink-0 rounded-full transition-opacity', !isVisible && 'opacity-30')}
              style={{ backgroundColor: lineColor }}
            />
          )}

          {!isCollapsed && <span className={cn('truncate', !isVisible && 'text-muted-foreground')}>{groupName}</span>}
        </Button>
      </AppTooltip>
    </SidebarMenuItem>
  );
}

export { DiaryMenuItem, type DiaryMenuItemProps };
