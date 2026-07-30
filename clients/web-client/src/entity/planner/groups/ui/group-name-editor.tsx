'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useNotify } from '@/shared/project-ui';
import { Button, Input } from '@/shared/ui-kit';

interface GroupNameEditorProps {
  readonly name: string;
  readonly loading: boolean;
  readonly isEdit: boolean;
  readonly className?: string;
  readonly onNameChange: (name: string) => void;
  readonly onIsEditChange: (value: boolean) => void;
}

function GroupNameEditor({ name, isEdit, className, loading, onNameChange, onIsEditChange }: GroupNameEditorProps) {
  const [draftName, setDraftName] = useState(name);

  const [isNameInvalid, setIsNameInvalid] = useState(false);
  const isNameChange = draftName !== name;

  const { warning } = useNotify();

  const validate = (value: string) => {
    if (value.length < 3 || value.length > 255) {
      warning({ message: 'Длинна имени не меньше 3 и не больше 255 символов', duration: 5000, position: 'top-center' });
      setIsNameInvalid(true);
      return false;
    }
    return true;
  };

  return (
    <div className={className}>
      {isEdit ? (
        <div
          className="h-10 flex items-center gap-2"
          onClick={(evt) => {
            evt.stopPropagation();
            evt.preventDefault();
          }}
        >
          <Input
            autoFocus
            name={`name:${name}`}
            className="font-normal ml-1"
            disabled={loading}
            value={draftName}
            aria-invalid={isNameInvalid}
            placeholder="Поиск по группам"
            onChange={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              setIsNameInvalid(false);
              setDraftName(evt.target.value);
            }}
            onKeyDown={(evt) => {
              if (!isNameChange || isNameInvalid) return;
              if (evt.key !== 'Enter') return;
              evt.preventDefault();
              evt.stopPropagation();
              if (validate(draftName)) {
                onNameChange(draftName);
                onIsEditChange?.(false);
              }
            }}
          />

          <div className="flex gap-1">
            <Button
              disabled={isNameInvalid || !isNameChange}
              variant="outline"
              size="icon-sm"
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                if (validate(draftName)) {
                  onNameChange(draftName);
                  onIsEditChange?.(false);
                }
              }}
            >
              <Check />
            </Button>

            <Button
              variant="destructive"
              size="icon-sm"
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                onIsEditChange?.(false);
              }}
            >
              <X />
            </Button>
          </div>
        </div>
      ) : (
        name
      )}
    </div>
  );
}

export { GroupNameEditor, type GroupNameEditorProps };
