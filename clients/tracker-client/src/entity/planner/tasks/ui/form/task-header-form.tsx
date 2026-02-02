import { ReadableInputForm } from '@/shared/components/form';
import { type ReactNode, useState } from 'react';

interface TaskHeaderFormProps {
  readonly beforeNameSlot?: ReactNode;
  readonly afterNameSlot?: ReactNode;
  readonly isCreate?: boolean;
  readonly onOk?: () => void;
  readonly onCancel?: () => void;
}

function TaskHeaderForm({
  afterNameSlot,
  beforeNameSlot,
  isCreate,
  onOk,
  onCancel,
}: TaskHeaderFormProps) {
  const [editName, setEditName] = useState(isCreate);

  return (
    <ReadableInputForm
      name="name"
      placeholder="Задайте имя"
      className="border-b"
      showControls={!isCreate}
      mode={editName ? 'edit' : 'read'}
      beforeNameSlot={beforeNameSlot}
      afterNameSlot={(!editName || isCreate) && afterNameSlot}
      onOk={() => {
        setEditName(false);
        onOk?.();
      }}
      onCancel={() => {
        setEditName(false);
        onCancel?.();
      }}
      onModeChange={(mode) => void setEditName(mode === 'edit')}
    />
  );
}

export { TaskHeaderForm };
