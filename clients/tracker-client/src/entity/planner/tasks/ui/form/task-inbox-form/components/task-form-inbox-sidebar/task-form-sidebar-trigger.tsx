import { Button } from '@/shared/ui-kit/ui/button';
import { useSidebar } from '@/shared/ui-kit/ui/sidebar';
import { cn } from '@/shared/ui-kit/utils';
import { PanelLeftIcon } from 'lucide-react';

function TaskFormSidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      className={cn('size-4', className)}
      type="button"
      size="icon"
      variant="ghost"
      tabIndex={-1}
      onClick={() => void toggleSidebar()}
    >
      <PanelLeftIcon className="size-5" />
    </Button>
  );
}

export { TaskFormSidebarTrigger };
