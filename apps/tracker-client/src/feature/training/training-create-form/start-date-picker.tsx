import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui-kit/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui-kit/ui/popover';
import { Button } from '@/shared/ui-kit/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/shared/ui-kit/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/shared/ui-kit/utils';
import { ru } from 'date-fns/locale';
import { useState } from 'react';

function StartDatePicker() {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      name="startDate"
      render={({ field }) => (
        <FormItem className="flex flex-col grow">
          <FormLabel>Дата начала</FormLabel>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-auto pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value ? format(field.value, 'dd MMM y') : <span>Сегодня?</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={ru}
                fromDate={new Date()}
                selected={field.value}
                onSelect={field.onChange}
                onDayClick={() => void setOpen(false)}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { StartDatePicker };
