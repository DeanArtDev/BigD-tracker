import { Typography } from '@/shared/components/typography';
import { SelectedGroupList } from './selected-group-list';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui-kit/ui/drawer';
import type { ReactNode } from 'react';

interface TaskDiaryDrawerProps {
  readonly trigger: ReactNode;
}

function TaskDiaryDrawer({ trigger }: TaskDiaryDrawerProps) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>

      <DrawerContent className="data-[vaul-drawer-direction=right]:min-w-[70vw] p-2">
        <DrawerHeader>
          <DrawerTitle asChild>
            <Typography.H4 className="text-base">Фильтр по группам</Typography.H4>
          </DrawerTitle>
          <DrawerDescription className="sr-only" />
        </DrawerHeader>

        <SelectedGroupList />
      </DrawerContent>
    </Drawer>
  );
}

export { TaskDiaryDrawer, type TaskDiaryDrawerProps };
