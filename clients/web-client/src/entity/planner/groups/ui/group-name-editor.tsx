'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';
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

  const isNameValid = draftName.trim().length > 3;
  const isNameChange = draftName !== name;

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
            aria-invalid={!isNameValid}
            placeholder="Поиск по группам"
            onChange={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              setDraftName(evt.target.value);
            }}
            onKeyDown={(evt) => {
              if (!isNameChange) return;
              if (evt.key !== 'Enter') return;
              evt.preventDefault();
              evt.stopPropagation();
              onNameChange(draftName);
              onIsEditChange?.(false);
            }}
          />

          <div className="flex gap-1">
            <Button
              disabled={!isNameValid || !isNameChange}
              variant="outline"
              size="icon-sm"
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                onNameChange(draftName);
                onIsEditChange?.(false);
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
