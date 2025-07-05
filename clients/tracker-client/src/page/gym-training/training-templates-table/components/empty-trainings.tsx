import { useInvalidateTrainingsTemplates } from '@/entity/training-templates';
import { TrainingTemplateManageDialog } from '@/feature/training/training-manage-form';
import { useBoolean } from 'usehooks-ts';
import { Button } from '@/shared/ui-kit/ui/button';

function EmptyTrainings() {
  const invalidate = useInvalidateTrainingsTemplates();
  const { value, setValue, setTrue, setFalse } = useBoolean(false);

  return (
    <div className="border-2 border-dotted rounded-lg grow p-2 m-4 flex flex-col justify-center items-center">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center mb-4">
        У тебя нет ни одной тренировки, добавим?
      </h3>
      <Button size="lg" onClick={setTrue}>
        Добавить
      </Button>

      <TrainingTemplateManageDialog
        open={value}
        onOpenChange={setValue}
        onSuccess={() => {
          setFalse();
          invalidate();
        }}
      />
    </div>
  );
}

export { EmptyTrainings };
