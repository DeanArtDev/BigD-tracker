import { DatePickerForm } from '@/shared/components/form';
import { Collapsible, CollapsibleContent } from '@/shared/ui-kit/ui/collapsible';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui-kit/ui/tabs';
import { useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useTaskFieldsRulesContext } from '../../context';
import { useValidationSchema } from '../../lib/use-validation-schema';

function UntilBlock() {
  const { rules } = useTaskFieldsRulesContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validationSchema = useValidationSchema();
  type TaskFormData = z.input<typeof validationSchema>;

  const { setValue } = useFormContext<TaskFormData>();

  const startDate = useWatch<{ startDate: TaskFormData['startDate'] }>({ name: 'startDate' });
  const recurrence = useWatch<{ recurrence: TaskFormData['recurrence'] }>({
    name: 'recurrence',
  }) as TaskFormData['recurrence'];

  return (
    <div className="flex flex-col items-center justify-between grow gap-2">
      <Tabs
        value={recurrence?.isEndless ? 'never' : 'onDate'}
        className="w-full"
        onValueChange={(v) => {
          setValue('recurrence.isEndless', v === 'never', { shouldDirty: true, shouldValidate: true });
        }}
      >
        <TabsList>
          <TabsTrigger value="never">Постоянно</TabsTrigger>
          <TabsTrigger value="onDate">До даты</TabsTrigger>
        </TabsList>
      </Tabs>

      <Collapsible open={!recurrence?.isEndless} className="w-full">
        <CollapsibleContent className="flex grow">
          <DatePickerForm<TaskFormData>
            name="recurrence.end"
            disabled={rules?.recurrence.isDisabled}
            isErrorMessage={false}
            min={startDate ?? undefined}
            endDay
            classNames={{ wrapper: 'flex grow', trigger: 'grow ml-2 max-h-[30px]' }}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export { UntilBlock };
