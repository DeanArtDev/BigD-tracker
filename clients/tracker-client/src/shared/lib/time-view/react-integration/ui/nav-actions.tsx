import { Button } from '@/shared/ui-kit/ui/button';
import { ChevronLeft, ChevronRight, Crosshair } from 'lucide-react';
import { useTimeViewController } from '../model';

function NavActions() {
  const controller = useTimeViewController();

  return (
    <div className="flex gap-2">
      <Button size="icon" variant="secondary" onClick={controller.api.prev}>
        <ChevronLeft />
      </Button>

      <Button variant="secondary" onClick={controller.api.today}>
        <Crosshair />
      </Button>

      <Button size="icon" variant="secondary" onClick={controller.api.next}>
        <ChevronRight />
      </Button>
    </div>
  );
}

export { NavActions };
