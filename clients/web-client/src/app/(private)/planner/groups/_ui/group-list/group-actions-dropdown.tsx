import { EllipsisVertical, Pencil } from 'lucide-react';
import { taskActionToIconMap, TaskActionType } from '@/entity/planner/tasks';
import { AppDropdown, DropdownItem } from '@/shared/project-ui';
import { Button, cn, DropdownMenuSeparator } from '@/shared/ui-kit';

interface GroupActionsDropdownProps {
  readonly loading: boolean;
  readonly onNameEdit: () => void;
  readonly onDelete: () => void;
}

function GroupActionsDropdown({ loading, onDelete, onNameEdit }: GroupActionsDropdownProps) {
  const actions = [
    {
      element: (
        <DropdownItem
          key="edit"
          variant="default"
          disabled={loading}
          onClick={(evt) => {
            evt.stopPropagation();
            onNameEdit();
          }}
        >
          <Pencil />
          Изменить имя
        </DropdownItem>
      ),
    },

    { element: <DropdownMenuSeparator key="separator-1" /> },

    {
      element: (
        <DropdownItem
          key="delete"
          variant="destructive"
          disabled={loading}
          onClick={(evt) => {
            evt.stopPropagation();
            onDelete();
          }}
        >
          {taskActionToIconMap[TaskActionType.Delete]({})}
          Удалить
        </DropdownItem>
      ),
    },
  ];

  return (
    <AppDropdown
      align="end"
      trigger={
        <Button
          variant="ghost"
          className={cn('border-none focus-visible:outline-none focus-visible:border-none focus-visible:ring-0 size-7')}
        >
          <EllipsisVertical />
        </Button>
      }
    >
      {actions.map((action) => action.element)}
    </AppDropdown>
  );
}

export { GroupActionsDropdown, type GroupActionsDropdownProps };
