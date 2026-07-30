'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button, cn, InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui-kit';

interface AppSearchInputProps {
  readonly value?: string;
  readonly placeholder?: string;
  readonly className?: string;
  readonly onSearch: (value: string | undefined) => void;
}

function AppSearchInput({ value, placeholder, className, onSearch }: AppSearchInputProps) {
  const [draftSearch, setDraftSearch] = useState(value ?? '');

  return (
    <InputGroup className={cn('w-fit', className)}>
      <InputGroupInput
        placeholder={placeholder}
        value={draftSearch}
        onChange={(event) => {
          setDraftSearch(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          onSearch(draftSearch);
        }}
        onBlur={(event) => {
          event.preventDefault();
          onSearch(draftSearch);
        }}
      />

      <InputGroupAddon className="gap-1" align="inline-end">
        {draftSearch.length > 0 && (
          <Button
            className="rounded-xl size-5"
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setDraftSearch('');
              onSearch(undefined);
            }}
          >
            <X className="size-3" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          onClick={() => {
            onSearch(draftSearch);
          }}
        >
          <Search />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { AppSearchInput, type AppSearchInputProps };
