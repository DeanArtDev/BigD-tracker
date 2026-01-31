import { ButtonClose } from '@/shared/components/button-close';
import { useFormStateEmitter } from '@/shared/components/form';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';
import type { ReactNode } from 'react';

const GroupFormLazy = withLazy(() =>
  import('./group-form').then((m) => ({ default: m.GroupForm })),
);

interface GroupFormDialogProps {
  readonly open: boolean;
  readonly loading?: boolean;
  readonly trigger?: ReactNode;
  readonly onOpenChange?: (value: boolean) => void;
  readonly onSubmit: (formData: { name: string; description?: string }) => void;
}

function GroupFormDialog({ open, loading, trigger, onSubmit, onOpenChange }: GroupFormDialogProps) {
  const { formEmitterState, formStateEmitterProps } = useFormStateEmitter();
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  const closeWithConfirm = (value: boolean) => {
    viaConfirmation({
      isNeedConfirm: () => formEmitterState.isDirty && !value,
      callback: () => void onOpenChange?.(value),
      dialog: { title: 'Закрыть?', content: 'Не сохраненные данные будут потеряны!' },
    });
  };

  return (
    <>
      <AppDialog
        modal={false}
        trigger={trigger}
        open={open}
        onOpenChange={(value) => {
          if (formEmitterState.isLoading) return;
          closeWithConfirm(value);
        }}
      >
        <div className="flex p-4 grow min-h-0 h-full min-w-0">
          <GroupFormLazy
            isLoading={loading}
            {...formStateEmitterProps}
            closeSlot={<ButtonClose onClick={() => void closeWithConfirm(false)} />}
            onSubmit={(formResult) => {
              onSubmit({ name: formResult.name, description: formResult.description });
            }}
          />
        </div>
      </AppDialog>

      {confirmHolder}
    </>
  );
}

export { GroupFormDialog };
