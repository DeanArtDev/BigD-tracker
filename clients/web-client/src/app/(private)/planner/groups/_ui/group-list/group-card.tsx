import { useState } from 'react';
import { GroupActionsDropdown, GroupId, GroupNameEditor } from '@/entity/planner/groups';
import { cn, Typography } from '@/shared/ui-kit';

interface GroupCardProps {
  readonly id: GroupId;
  readonly name: string;
  readonly loading: boolean;
  readonly className?: string;
  readonly onNameChange: (name: string) => void;
  readonly onDelete: (id: GroupId) => void;
}

function GroupCard({ id, className, loading, name, onNameChange, onDelete }: GroupCardProps) {
  const [isEdit, setIsEdit] = useState(false);

  return (
    <div
      className={cn('grid grid-cols-[1fr_min-content] items-center p-5 border-b truncate gap-2', className)}
      onClick={(evt) => {
        if (isEdit) {
          evt.preventDefault();
          evt.stopPropagation();
        }
      }}
    >
      <Typography.H5>
        <GroupNameEditor
          isEdit={isEdit}
          name={name}
          loading={loading}
          onIsEditChange={setIsEdit}
          onNameChange={onNameChange}
        />
      </Typography.H5>

      {!isEdit && (
        <GroupActionsDropdown loading={loading} onDelete={() => onDelete(id)} onNameEdit={() => void setIsEdit(true)} />
      )}
    </div>
  );
}

export { GroupCard, type GroupCardProps };
