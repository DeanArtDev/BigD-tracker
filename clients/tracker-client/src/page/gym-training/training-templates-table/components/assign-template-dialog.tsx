import { AdoptedDialog } from '@/shared/ui-kit/ui/adopted-dialog';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Calendar } from '@/shared/ui-kit/ui/calendar';
import { useEffect, useState } from 'react';
import { ru } from 'date-fns/locale';
import { Button } from '@/shared/ui-kit/ui/button';

interface AssignTemplateDialogProps {
  readonly templateId?: number;
  readonly loading?: boolean;
  readonly onOpenChange?: (value: boolean) => void;
  readonly onAssignDates: (values: Date[] | undefined) => void;
}

function AssignTemplateDialog({
  loading,
  templateId,
  onOpenChange,
  onAssignDates,
}: AssignTemplateDialogProps) {
  const [date, setDate] = useState<Date[] | undefined>(undefined);

  useEffect(() => () => void setDate(undefined), []);

  return (
    <AdoptedDialog
      slotsProps={{ content: { className: 'w-auto h-auto' } }}
      open={templateId != null}
      onOpenChange={onOpenChange}
    >
      <Calendar
        locale={ru}
        mode="multiple"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />

      <Button
        className="ml-auto"
        disabled={loading}
        onClick={() => {
          onAssignDates(date);
        }}
      >
        {loading && <AppLoader inverse />}
        Назначить
      </Button>
    </AdoptedDialog>
  );
}

export { AssignTemplateDialog, type AssignTemplateDialogProps };
