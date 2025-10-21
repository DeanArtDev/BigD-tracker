import { Button } from '@/shared/ui-kit/ui/button';
import { Plus } from 'lucide-react';

interface GroupAddButtonProps {
  readonly onClick: () => void;
}

function GroupAddButton({ onClick }: GroupAddButtonProps) {
  return (
    <Button
      className="flex-row w-full items-center opacity-40 hover:bg-transparent hover:opacity-100"
      variant="ghost"
      onClick={onClick}
    >
      <div className="h-[1px] w-full bg-gray-400" />
      <Plus className="size-5" color="var(--color-gray-500)" />
      <div className="h-[1px] w-full bg-gray-400" />
    </Button>
  );
}

export { GroupAddButton, type GroupAddButtonProps };
