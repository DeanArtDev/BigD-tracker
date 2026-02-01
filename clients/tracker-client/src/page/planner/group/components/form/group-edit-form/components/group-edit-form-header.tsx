import { ReadableInputForm } from '@/shared/components/form';
import { useState } from 'react';

function GroupEditFormHeader({ onCancel }: { onCancel?: () => void }) {
  const [editName, setEditName] = useState(false);

  return (
    <ReadableInputForm
      name="name"
      mode={editName ? 'edit' : 'read'}
      onOk={() => {
        setEditName(false);
      }}
      onCancel={() => {
        setEditName(false);
        onCancel?.();
      }}
      onModeChange={(mode) => void setEditName(mode === 'edit')}
    />
  );
}

export { GroupEditFormHeader };
