import { ReactNode } from 'react';
import { AppDropdown } from '@/shared/project-ui';
import { ListContent } from './list-content';
import { GroupId, GroupInfo } from '../../model';

interface GroupListPopoverProps {
  readonly trigger: ReactNode;
  readonly open?: boolean;
  readonly selectedGroupId?: GroupId;

  readonly onSelect: (group: GroupInfo) => void;
  readonly onOpenChange?: (value: boolean) => void;
}

function GroupListDropdown({ trigger, open, selectedGroupId, onOpenChange, onSelect }: GroupListPopoverProps) {
  return (
    <AppDropdown open={open} trigger={trigger} onOpenChange={onOpenChange} align="end" className="max-h-145">
      <ListContent selectedGroupId={selectedGroupId} onSelect={onSelect} />
    </AppDropdown>
  );
}

export { GroupListDropdown, type GroupListPopoverProps };
