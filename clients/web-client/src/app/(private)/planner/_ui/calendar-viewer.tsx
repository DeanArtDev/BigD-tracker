'use client';

import { CalendarIcon } from 'lucide-react';
import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@/shared/ui-kit';

function CalendarViewer() {
  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost">
          <CalendarIcon className="size-4 stroke-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-auto" align="end">
        <Calendar
          mode="single"
          modifiersClassNames={{
            planned: 'bg-primary text-primary-foreground',
            today: 'bg-primary text-primary-foreground',
          }}
          numberOfMonths={3}
          className="p-3 [--cell-size:--spacing(8)] [&_[role=gridcell]_button]:pointer-events-none"
        />
      </PopoverContent>
    </Popover>
  );
}

export { CalendarViewer };
