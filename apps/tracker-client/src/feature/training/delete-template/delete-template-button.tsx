import { useTrainingDelete } from '@/entity/trainings';
import { AlertConfirmDialog } from '@/shared/components/alert-confirm-dialog';
import { Button } from '@/shared/ui-kit/ui/button';
import { Trash2 } from 'lucide-react';

type DeleteTemplateButtonProps = Parameters<typeof Button>[0] & {
  readonly trainingId: number;
  readonly onSuccess?: () => void;
};

function DeleteTemplateButton({
  trainingId,
  onSuccess,
  ...buttonProps
}: DeleteTemplateButtonProps) {
  const { deleteTrigger, isPending } = useTrainingDelete();

  return (
    <AlertConfirmDialog
      title="Ты уверен что хочешь удалить?"
      onConfirm={() => void deleteTrigger({ params: { path: { trainingId } } }, { onSuccess })}
    >
      <Button {...buttonProps} variant="destructive" disabled={isPending || buttonProps.disabled}>
        <Trash2 />
      </Button>
    </AlertConfirmDialog>
  );
}

export { DeleteTemplateButton, type DeleteTemplateButtonProps };
