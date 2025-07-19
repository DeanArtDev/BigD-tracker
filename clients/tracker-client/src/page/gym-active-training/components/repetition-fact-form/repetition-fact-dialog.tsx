import { withLazy } from '@/shared/lib/react/with-lazy';
import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';
import { cn } from '@/shared/ui-kit/utils';
import { type JSX, useState } from 'react';
import type { RepetitionFactFormProps } from './repetition-fact-form';

type RepetitionFactDialogProps = RepetitionFactFormProps & {
  childRender: (params: { open: () => void; close: () => void }) => JSX.Element;
};

const RepetitionFactFormLazy = withLazy(() =>
  import('./repetition-fact-form').then((m) => ({ default: m.RepetitionFactForm })),
);

function RepetitionFactDialog({ repetition, childRender, onSuccess }: RepetitionFactDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppDialog
        open={open}
        title="Так че по факту?"
        className={cn(
          'min-w-full sm:min-w-[450px] h-fit w-fit p-4',
          '[&_.bottom-mobile-space]:hidden [&_.top-mobile-space]:hidden',
        )}
        onOpenChange={setOpen}
      >
        <RepetitionFactFormLazy
          repetition={repetition}
          onSuccess={(formData) => {
            onSuccess(formData);
            setOpen(false);
          }}
        />
      </AppDialog>

      {childRender({ open: setOpen.bind(null, true), close: setOpen.bind(null, false) })}
    </>
  );
}

export { RepetitionFactDialog, type RepetitionFactDialogProps };
