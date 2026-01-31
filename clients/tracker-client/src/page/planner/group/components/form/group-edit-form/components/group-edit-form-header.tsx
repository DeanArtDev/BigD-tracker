import { useState } from 'react';
import { ReadableInputForm } from '@/shared/components/form';

function GroupEditFormHeader() {
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
      }}
      onModeChange={(mode) => void setEditName(mode === 'edit')}
    />
  );
}

export { GroupEditFormHeader };
