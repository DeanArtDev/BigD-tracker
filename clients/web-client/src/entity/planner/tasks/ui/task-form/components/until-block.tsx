import { useFormContext, useWatch } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui-kit';
import { DatePickerForm } from '@/shared/ui-kit/form';
import { GroupBrand, TaskFormData } from '../context/task-form-provider';

function UntilBlock<TGroupId extends GroupBrand>() {
  const { setValue, control } = useFormContext<TaskFormData<TGroupId>>();

  const [startDate, isEndless] = useWatch({ control, name: ['startDate', 'isEndless'] });

  return (
    <div className="flex items-center grow gap-2 min-h-10">
      <Tabs
        value={isEndless ? 'endless' : 'onDate'}
        onValueChange={(v) => {
          setValue('isEndless', v === 'endless', { shouldDirty: true });
        }}
      >
        <TabsList>
          <TabsTrigger value="endless">Постоянно</TabsTrigger>
          <TabsTrigger value="onDate">До даты</TabsTrigger>
        </TabsList>
      </Tabs>

      {!isEndless && (
        <DatePickerForm<TaskFormData<TGroupId>>
          name="untilDate"
          classNames={{ wrapper: 'w-fit' }}
          isErrorMessage={false}
          hideTimeSelector
          min={startDate ?? undefined}
        />
      )}
    </div>
  );
}

export { UntilBlock };
