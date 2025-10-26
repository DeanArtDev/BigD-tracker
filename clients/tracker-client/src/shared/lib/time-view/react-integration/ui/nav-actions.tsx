import { Button } from '@/shared/ui-kit/ui/button';
import type { Dayjs } from '@/shared/lib/time';
import { ChevronLeft, ChevronRight, Crosshair } from 'lucide-react';
import { useTimeViewController } from '../model';

interface NavActionsProps {
  readonly onDateChange?: (date: Dayjs) => void;
}

function NavActions({ onDateChange }: NavActionsProps) {
  const controller = useTimeViewController();

  return (
    <div className="flex gap-2">
      <Button
        size="icon"
        variant="secondary"
        onClick={() => {
          const date = controller.api.prev();
          onDateChange?.(date);
        }}
      >
        <ChevronLeft />
      </Button>

      <Button
        variant="secondary"
        onClick={() => {
          const date = controller.api.today();
          onDateChange?.(date);
        }}
      >
        <Crosshair />
      </Button>

      <Button
        size="icon"
        variant="secondary"
        onClick={() => {
          const date = controller.api.next();
          onDateChange?.(date);
        }}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}

export { NavActions };
