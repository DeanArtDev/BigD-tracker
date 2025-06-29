import { Button } from '@/shared/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui-kit/ui/dropdown-menu';
import { IconDotsVertical } from '@tabler/icons-react';

interface TrainingsTableActionsProps {
  readonly disable?: boolean;
  readonly canEdit?: boolean;
  readonly canDelete?: boolean;
  readonly onEdit: () => void;
  readonly onAssign: () => void;
  readonly onDelete: () => void;
}

function TrainingsTableActions({
  disable,
  canEdit = false,
  canDelete = false,
  onDelete,
  onAssign,
  onEdit,
}: TrainingsTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8 ml-auto"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem
          disabled={disable || !canEdit}
          onClick={(evt) => {
            evt.stopPropagation();
            onEdit();
          }}
        >
          Изменить
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={disable}
          onClick={(evt) => {
            evt.stopPropagation();
            onAssign();
          }}
        >
          Назначить
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={disable || !canDelete}
          variant="destructive"
          onClick={(evt) => {
            evt.stopPropagation();
            onDelete();
          }}
        >
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { TrainingsTableActions };
