import { TrainingPreview } from '@/entity/trainings';
import { DeleteTemplateButton } from '@/feature/training/delete-template/delete-template-button';
import { getTraining } from '@/page/gym-training/trainings-calendar/helpers';
import type { ApiDto } from '@/shared/api/types';
import { CalendarContentView } from './components/calendar-content-view';
import { useResizeTable } from './use-resize-table';
import { Button } from '@/shared/ui-kit/ui/button';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { cn } from '@/shared/ui-kit/utils';
import ruLocale from '@fullcalendar/core/locales/ru';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { format } from 'date-fns';
import { debounce } from 'lodash-es';
import { ChevronLeft, ChevronRight, Shrink } from 'lucide-react';
import { useRef, useState } from 'react';
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
  1000,
  { leading: true, trailing: false },
);

function TrainingsCalendar() {
  const calendarRef = useRef<FullCalendar | null>(null);
  useResizeTable({ onResize: () => void calendarRef.current?.doResize() });

  const {
    isLoading,
    isAssignLoading,
    events,
    setFilters,
    assignTraining,
    updateStartDate,
    invalidateCalendarData,
  } = useTrainingsCalendar();

  const [training, setTraining] = useState<ApiDto['TrainingAggregationDto'] | undefined>();

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
          selectable={false}
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
            return <span className="font-thin leading-none">{format(data.date, 'HH:mm')}</span>;
          }}
          timeZone="local"
          events={events}
          eventAllow={(dropInfo) => {
            if (isAssignLoading) return false;
            const date = dropInfo.start;

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (date < now) {
              debouncedWarningToast();
              return false;
            }

            return true;
          }}
          eventChange={(info) => {
            const training = getTraining(info.event.extendedProps.extra);
            if (info.event.start == null || training == null) return;
            updateStartDate({ id: training.id, startDate: info.event.start?.toISOString() });
            assignTraining(
              {
                body: {
                  data: [{ trainingId: training.id, startDate: info.event.start.toISOString() }],
                },
              },
              {
                onError: () => {
                  if (info.oldEvent.start == null) return;
                  updateStartDate({
                    id: training.id,
                    startDate: info.oldEvent.start?.toISOString(),
                  });
                },
              },
            );
          }}
          eventClick={(info) => {
            setTraining(getTraining(info.event.extendedProps.extra));
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
          eventContent={(arg) => {
            return (
              <CalendarContentView
                bgcolor={arg.backgroundColor}
                title={arg.event.title}
                isLoading={isAssignLoading}
                isDraggable={arg.isDraggable}
              />
            );
          }}
        />
      </DataLoader>

      <TrainingPreview
        training={training}
        appendContentSlot={
          !!training && (
            <DeleteTemplateButton
              className="ml-auto"
              trainingId={training?.id}
              onSuccess={() => {
                invalidateCalendarData();
                setTraining(undefined);
              }}
            />
          )
        }
        onOpenChange={(v) => {
          if (!v) setTraining(undefined);
        }}
      />
    </div>
  );
}

export { TrainingsCalendar };
