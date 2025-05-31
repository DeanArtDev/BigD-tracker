import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui-kit/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui-kit/ui/tooltip';
import type { PropsWithChildren } from 'react';

interface ExerciseConfirmDeleteProps {
  readonly on?: boolean;
  readonly onOk: () => void;
  readonly onCancel?: () => void;
}

function ExerciseConfirmDelete({
  on = false,
  children,
  onOk,
  onCancel,
}: PropsWithChildren<ExerciseConfirmDeleteProps>) {
  if (on) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ты уверен что хочешь удалить?</AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogDescription />

          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>Нет</AlertDialogCancel>
            <AlertDialogAction onClick={onOk}>Да</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>{children}</TooltipTrigger>

      <TooltipContent>
        <p>Удалять можно только свои упражнения</p>
      </TooltipContent>
    </Tooltip>
  );
}

export { ExerciseConfirmDelete, type ExerciseConfirmDeleteProps };
