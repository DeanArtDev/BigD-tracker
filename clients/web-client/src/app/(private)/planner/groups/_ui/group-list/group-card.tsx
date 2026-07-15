import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { Button, cn, Input } from '@/shared/ui-kit';
import { GroupActionsDropdown } from './group-actions-dropdown';

interface GroupCardProps {
  readonly id: GroupId;
  readonly name: string;
  readonly loading: boolean;
  readonly className?: string;
  readonly onClick: (id: GroupId) => void;
  readonly onNameChange: (name: string) => void;
  readonly onDelete: (id: GroupId) => void;
}

function GroupCard({ id, className, loading, name, onClick, onNameChange, onDelete }: GroupCardProps) {
  const [isEdit, setIsEdit] = useState(false);
  const [draftName, setDraftName] = useState(name);

  const isNameValid = draftName.trim().length > 3;
  const isNameChange = draftName !== name;

  return (
    <div
      className={cn('grid grid-cols-[1fr_min-content] items-center p-5 border-b truncate gap-2', className)}
      onClick={(evt) => {
        evt.stopPropagation();
        if (!isEdit) onClick?.(id);
      }}
    >
      {isEdit ? (
        <div className="h-10 flex items-center gap-2" onClick={(evt) => void evt.stopPropagation()}>
          <Input
            autoFocus
            disabled={loading}
            value={draftName}
            aria-invalid={!isNameValid}
            placeholder="Поиск по группам"
            onChange={(evt) => {
              setDraftName(evt.target.value);
            }}
            onKeyDown={(evt) => {
              if (!isNameChange) return;
              if (evt.key !== 'Enter') return;
              evt.preventDefault();
              onNameChange(draftName);
              setIsEdit(false);
            }}
          />

          <div className="flex gap-1">
            <Button
              disabled={!isNameValid || !isNameChange}
              variant="outline"
              size="icon-sm"
              onClick={() => {
                onNameChange(draftName);
                setIsEdit(false);
              }}
            >
              <Check />
            </Button>

            <Button
              variant="destructive"
              size="icon-sm"
              onClick={() => {
                setIsEdit(false);
              }}
            >
              <X />
            </Button>
          </div>
        </div>
      ) : (
        name
      )}

      {!isEdit && (
        <GroupActionsDropdown loading={loading} onDelete={() => onDelete(id)} onNameEdit={() => void setIsEdit(true)} />
      )}
    </div>
  );
}

export { GroupCard, type GroupCardProps };
