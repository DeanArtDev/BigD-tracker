import { DatePickerForm } from '@/shared/components/form';
import { Button } from '@/shared/ui-kit/ui/button';
import { Plus } from 'lucide-react';
import { TaskDeadlineDate } from '@/entity/planner/tasks/ui';

function TaskFormInboxDates() {
  return (
    <DatePickerForm
      name="deadline"
      min={new Date()}
      renderInput={({ value }) => {
        return (
          <Button className="w-full justify-between px-2" variant="ghost" tabIndex={-1}>
            <span>Дедлайн:</span>
            {value != null ? <TaskDeadlineDate deadline={value} size={15} showDate /> : <Plus />}
          </Button>
        );
      }}
    />
  );
}

export { TaskFormInboxDates };
