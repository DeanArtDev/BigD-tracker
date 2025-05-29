import { useResizeTable } from '@/page/gym-training/trainings-calendar/use-resize-table';
import { useIsMobile } from '@/shared/ui-kit/hooks/use-mobile';
import { Button } from '@/shared/ui-kit/ui/button';
import { Card } from '@/shared/ui-kit/ui/card';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { cn } from '@/shared/ui-kit/utils';
import ruLocale from '@fullcalendar/core/locales/ru';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { format } from 'date-fns';
import { debounce } from 'lodash-es';
import { ChevronLeft, ChevronRight, GripVertical, Shrink } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import { useTrainingsCalendar } from './use-trainings-calendar';
import './styles.css';

let toastId: number | string | undefined;
const debouncedWarningToast = debounce(
  () => {
    toast.dismiss(toastId);
    toastId = toast.warning('Тренировка не может быть перемещена в прошлое', {
      position: 'top-center',
    });
  },
  5000,
  { leading: true, trailing: false },
);

function TrainingsCalendar() {
  const calendarRef = useRef<FullCalendar | null>(null);
  useResizeTable({ onResize: () => void calendarRef.current?.doResize() });

  const { isLoading, events, setFilters, update } = useTrainingsCalendar();

  const isMobile = useIsMobile();

  return (
    <div className={cn('flex flex-col text-xs relative')}>
      <DataLoader blur isLoading={isLoading}>
        <div className="flex gap-2 mb-4 justify-end items-center">
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mr-auto">
            {calendarRef.current?.getApi()?.view.title}
          </h3>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const calendarApi = calendarRef.current?.getApi();
              calendarApi?.prev();
            }}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const calendarApi = calendarRef.current?.getApi();
              calendarApi?.next();
            }}
          >
            <ChevronRight />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const calendarApi = calendarRef.current?.getApi();
              calendarApi?.today();
            }}
          >
            <Shrink />
          </Button>
        </div>

        <FullCalendar
          editable
          selectable
          height="auto"
          nowIndicator
          ref={calendarRef}
          locale={ruLocale}
          slotMinTime="06:00:00"
          slotMaxTime="24:00:00"
          initialView="dayGridMonth"
          eventDurationEditable={false}
          eventResizableFromStart={false}
          plugins={[dayGridPlugin, interactionPlugin]}
          dayHeaderFormat={(input) => {
            return format(input.date.marker, 'EEEEEE').toUpperCase();
          }}
          titleFormat={{ day: '2-digit', year: '2-digit', month: '2-digit' }}
          headerToolbar={{ start: '', center: '', end: '' }}
          slotLabelContent={(data) => {
            return (
              <span className="font-thin leading-none">{format(data.date, 'HH:mm')}</span>
            );
          }}
          timeZone="local"
          events={events}
          eventAllow={(dropInfo) => {
            const date = dropInfo.start;

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (date < now) {
              debouncedWarningToast();
              return false;
            }

            return true;
          }}
          eventChange={console.dir}
          eventClick={(info) => {
            console.log(info.event.extendedProps.extra);
          }}
          datesSet={(info) => {
            setFilters({
              from: new Date(info.start).toISOString(),
              to: new Date(info.end).toISOString(),
            });
          }}
          dateClick={(info) => {
            console.log(`Вы кликнули по дате: ${info.dateStr}`);
          }}
          eventDrop={(info) => {
            const training = info.event.extendedProps.extra;
            update({
              params: { path: { trainingId: training.id } },
              body: { data: { startDate: info.event.start?.toISOString() } },
            });
          }}
          eventContent={(arg) => {
            return (
              <Card
                className={cn(
                  'flex flex-row justify-between gap-2 items-center text-xs p-1 rounded-md',
                  arg.backgroundColor,
                  { ['h-[40px]']: isMobile },
                )}
              >
                {!isMobile && (
                  <span className="w-full text-center wrap-anywhere whitespace-normal">
                    {arg.event.title}
                  </span>
                )}
                {arg.isDraggable && (
                  <GripVertical
                    className={cn('relative right-[-5px]', {
                      'ml-auto': isMobile,
                    })}
                    size={15}
                  />
                )}
              </Card>
            );
          }}
        />
      </DataLoader>
    </div>
  );
}

export { TrainingsCalendar };
