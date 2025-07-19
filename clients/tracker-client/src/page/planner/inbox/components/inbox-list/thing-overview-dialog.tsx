import { useInboxQuery } from '@/entity/planner/groups';
import type { ApiDto } from '@/shared/api/types';
import { useFormStateEmitter } from '@/shared/components/form';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';

const ThingOverviewLazy = withLazy(() =>
  import('@/entity/planner/things/ui/thing-overview').then((m) => ({ default: m.ThingOverview })),
);

interface ThingOverviewDialogProps {
  readonly thingId?: number;
  readonly isLoading: boolean;
  readonly onChange?: (thing: ApiDto['ThingDto']) => void;
  readonly onOpenChange: (open: boolean) => void;
}

function ThingOverviewDialog({
  thingId,
  isLoading,
  onOpenChange,
  onChange,
}: ThingOverviewDialogProps) {
  const { inbox } = useInboxQuery();
  const thing = inbox?.things.find((thing) => thing.id === thingId);

  const { confirmHolder, viaConfirmation } = useConfirmDialog();
  const { formEmitterState, formStateEmitterProps } = useFormStateEmitter();

  return (
    <AppDialog
      open={thing != null}
      className="sm:max-w-[1000px] sm:h-full sm:max-h-[70vh] p-0 sm:p-0"
      onOpenChange={(value) => {
        if (isLoading) return;
        viaConfirmation({
          isNeedConfirm: () => formEmitterState.isDirty && !value,
          callback: () => void onOpenChange(value),
        });
      }}
    >
      {thing != null && (
        <ThingOverviewLazy
          thing={thing}
          disabled={isLoading}
          onChange={onChange}
          {...formStateEmitterProps}
        />
      )}

      {confirmHolder}
    </AppDialog>
  );
}

export { ThingOverviewDialog, type ThingOverviewDialogProps };
