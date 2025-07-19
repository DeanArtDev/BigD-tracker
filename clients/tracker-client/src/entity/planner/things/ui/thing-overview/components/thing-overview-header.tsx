import { InputForm } from '@/shared/components/form';
import { useConfirmDialog, useIsMobile } from '@/shared/ui-kit/helpers';
import { Button } from '@/shared/ui-kit/ui/button';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui-kit/ui/dialog';
import { useSidebar } from '@/shared/ui-kit/ui/sidebar';
import { cn } from '@/shared/ui-kit/utils';
import { Check, PanelLeftIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import type { ThingEditorFormData } from '../thing-overview';

interface ThingOverviewHeaderProps {
  readonly onOk: () => void;
  readonly onCancel: () => void;
}

function ThingOverviewHeader({ onOk, onCancel }: ThingOverviewHeaderProps) {
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  const [editName, setEditName] = useState(false);
  const name = useWatch<{ name: ThingEditorFormData['name'] }>({ name: 'name' });

  const isMobile = useIsMobile();
  const showCloseButton = isMobile && !editName;
  const { toggleSidebar } = useSidebar();

  const { dirtyFields } = useFormState<ThingEditorFormData>();

  return (
    <DialogHeader className="flex-row w-full gap-0 justify-between">
      <DialogTitle
        className={cn('p-2.5 sm:p-4 flex items-center', [
          showCloseButton ? 'w-[95%] pr-0 sm:pr-0' : 'w-full',
        ])}
      >
        {showCloseButton && (
          <Button
            className="size-4 mt-0.5 mb-auto mr-3"
            size="icon"
            variant="ghost"
            onClick={toggleSidebar}
          >
            <PanelLeftIcon className="size-4" />
          </Button>
        )}

        {editName ? (
          <div className="flex w-full items-center gap-1">
            <InputForm autoFocus className="grow" name="name" />
            <Button
              className="mb-auto mt-0.5"
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                viaConfirmation({
                  isNeedConfirm: () => Boolean(dirtyFields['name']),
                  callback: () => {
                    setEditName(false);
                    onCancel();
                  },
                  dialog: { title: 'Имя не сохранено, отменить?' },
                });
              }}
            >
              <XIcon />
            </Button>

            <Button
              className="mb-auto mt-0.5 "
              type="submit"
              variant="ghost"
              size="sm"
              disabled={!dirtyFields['name']}
              onClick={() => {
                setEditName(false);
                onOk();
              }}
            >
              <Check />
            </Button>
          </div>
        ) : (
          <span
            className="grow text-center md:text-left break-words break-all"
            onClick={() => void setEditName(true)}
          >
            {name}
          </span>
        )}
      </DialogTitle>

      <DialogDescription className="absolute hidden" />

      {!editName && (
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              'size-10 mb-auto sm:mt-1.5 sm:mr-1',
              'opacity-70 hover:bg-transparent hover:opacity-100',
            )}
          >
            <XIcon className="size-4" />
          </Button>
        </DialogTrigger>
      )}

      {confirmHolder}
    </DialogHeader>
  );
}

export { ThingOverviewHeader };
