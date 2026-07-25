'use client';

import { Search } from 'lucide-react';
import { DataLoader, InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui-kit';

interface TaskSearchInputProps {
  readonly value: string;
  readonly loading: boolean;
  readonly onSearchChange: (value: string) => void;
}

function TaskSearchInput({ value, loading, onSearchChange }: TaskSearchInputProps) {
  return (
    <InputGroup className="h-12 rounded-2xl">
      <InputGroupAddon align="inline-start">
        <Search className="size-6" />
      </InputGroupAddon>

      <InputGroupInput
        value={value}
        className="text-lg md:text-lg"
        onChange={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          onSearchChange(evt.target.value);
        }}
        placeholder="Поиск по именам дел..."
      />

      <InputGroupAddon align="inline-end">{loading && <DataLoader.Loading className="size-6" />}</InputGroupAddon>
    </InputGroup>
  );
}

export { TaskSearchInput };
