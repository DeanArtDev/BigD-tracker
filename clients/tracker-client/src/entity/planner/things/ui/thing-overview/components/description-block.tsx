import { TextareaForm } from '@/shared/components/form';
import { useConfirmDialog, useContainerSizeObserver } from '@/shared/ui-kit/helpers';
import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import { useState } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import type { ThingEditorFormData } from '../thing-overview';

interface DescriptionBlockProps {
  readonly onOk: () => void;
  readonly onCancel?: () => void;
}

function DescriptionBlock({ onOk, onCancel }: DescriptionBlockProps) {
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  const [edit, setEdit] = useState(false);

  const { dirtyFields } = useFormState<ThingEditorFormData>();
  const description = useWatch<{ description: ThingEditorFormData['description'] }>({
    name: 'description',
  });

  const { ref, height } = useContainerSizeObserver<HTMLDivElement>();
  const hasDescription = description != null && description.trim() !== '';

  return (
    <div ref={ref} className={cn('relative flex w-full h-full flex-col')}>
      <div className="flex w-full h-full flex-col" style={{ height: height }}>
        {edit ? (
          <>
            <TextareaForm
              autoFocus
              name="description"
              key="editable"
              style={{ height: height - 48 }}
              className="md:text-base rounded-md border px-3 py-2 focus:outline-none resize-none"
              placeholder="Описание"
            />

            <div className="flex gap-3 mt-3 sm:mt-4 justify-end">
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => {
                  viaConfirmation({
                    isNeedConfirm: () => Boolean(dirtyFields['description']),
                    callback: () => {
                      setEdit(false);
                      onCancel?.();
                    },
                    dialog: { title: 'Описание не сохранено, отменить?' },
                  });
                }}
              >
                Отменить
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={!dirtyFields['description']}
                onClick={() => {
                  setEdit(false);
                  onOk();
                }}
              >
                Сохранить
              </Button>
            </div>
          </>
        ) : (
          <p
            className={cn('overflow-scroll', { 'text-gray-400': !hasDescription })}
            style={{ height }}
            onClick={() => void setEdit(true)}
          >
            {!hasDescription ? 'Описание' : description}
          </p>
        )}
      </div>

      {confirmHolder}
    </div>
  );
}

export { DescriptionBlock, type DescriptionBlockProps };
