import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import { Calendar } from '@/shared/ui-kit/ui/calendar';
import { useEffect, useState } from 'react';

interface AssignTemplateDialogProps {
  readonly templateId?: number;
  readonly loading?: boolean;
  readonly onOpenChange?: (value: boolean) => void;
  readonly onAssignDates: (values: Date[] | undefined) => void;
}

function AssignTemplateDialog({ loading, templateId, onOpenChange, onAssignDates }: AssignTemplateDialogProps) {
  const [date, setDate] = useState<Date[] | undefined>(undefined);

  useEffect(() => () => void setDate(undefined), []);

  return (
    <AppDialog
      className="w-auto p-2.5 sm:p-4 h-fit"
      open={templateId != null}
      footer={
        <Button
          className="ml-auto mt-2.5 sm:mt-4"
          disabled={loading}
          onClick={() => {
            onAssignDates(date);
          }}
        >
          {loading && <AppLoader inverse />}
          Назначить
        </Button>
      }
      onOpenChange={onOpenChange}
    >
      <Calendar mode="multiple" selected={date} onSelect={setDate} className="rounded-md border" />
    </AppDialog>
  );
}

export { AssignTemplateDialog, type AssignTemplateDialogProps };
