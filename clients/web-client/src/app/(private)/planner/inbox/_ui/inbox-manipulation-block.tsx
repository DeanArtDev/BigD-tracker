'use client';

import { Search, X } from 'lucide-react';
import { memo, useState } from 'react';
import { TaskPriorityPicker, TaskStatusSelect } from '@/entity/planner/tasks';
import { TaskStatus } from '@/entity/schema-types';
import { Button, InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui-kit';
import { useInboxUrlQuery } from '../_model/use-inbox-url-query';

interface InboxManipulationBlockProps {
  readonly onFiltersChange?: (filters: { status?: TaskStatus[]; priority?: number[] }) => void;
  readonly onSearchChange?: (search?: string) => void;
}

const InboxManipulationBlock = memo(function InboxManipulationBlockMemo({
  onSearchChange,
  onFiltersChange,
}: InboxManipulationBlockProps) {
  const [searchQuery] = useInboxUrlQuery();

  const filter = {
    search: searchQuery?.search,
    status: searchQuery?.status,
    priority: searchQuery?.priority?.map(Number) ?? [],
  };

  const [draftSearch, setDraftSearch] = useState(filter?.search ?? '');

  return (
    <div className="flex gap-5 items-center">
      <InputGroup className="max-w-[420px] w-full">
        <InputGroupInput
          placeholder="Поиск по имени..."
          value={draftSearch}
          onChange={(e) => {
            setDraftSearch(e.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            onSearchChange?.(draftSearch);
          }}
          onBlur={(event) => {
            event.preventDefault();
            onSearchChange?.(draftSearch);
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
                onSearchChange?.('');
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
              onSearchChange?.(draftSearch);
            }}
          >
            <Search />
          </Button>
        </InputGroupAddon>
      </InputGroup>

      <TaskPriorityPicker
        className="ml-auto"
        value={filter.priority}
        onChange={(values) => {
          const v = values.length <= 0 ? undefined : values;
          onFiltersChange?.({ priority: v, status: filter.status });
        }}
      />

      <TaskStatusSelect
        values={filter.status}
        onChange={(value) => {
          onFiltersChange?.({ status: value, priority: filter.priority });
        }}
      />
    </div>
  );
});

export { InboxManipulationBlock };
