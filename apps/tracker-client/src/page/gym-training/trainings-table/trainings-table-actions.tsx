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
  readonly onEdit: () => void;
  readonly onAssign: () => void;
  readonly onDelete: () => void;
}

function TrainingsTableActions({
  disable,
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
        <DropdownMenuItem disabled={disable} onClick={onEdit}>
          Изменить
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disable} onClick={onAssign}>
          Назначить
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={disable} variant="destructive" onClick={onDelete}>
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { TrainingsTableActions };
