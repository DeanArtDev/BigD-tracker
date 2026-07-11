'use client';

import { Search, X } from 'lucide-react';
import { memo, useState } from 'react';
import { TaskPriorityPicker, TaskStatusSelect } from '@/entity/planner/tasks';
import { Button, InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui-kit';
import { UseInboxUrlQuery, useInboxUrlQuery } from '../_model/use-inbox-url-query';

const InboxManipulationBlock = memo(function InboxManipulationBlockMemo() {
  const [searchQuery, setSearchQuery] = useInboxUrlQuery();

  const filter = {
    search: searchQuery?.search,
    status: searchQuery?.status,
    priority: searchQuery?.priority?.map(Number) ?? [],
  };

  const [draftSearch, setDraftSearch] = useState(filter?.search ?? '');

  const setSearch = (search: string) => void setSearchQuery((prev) => ({ ...prev, search: search }));
  const setFilters = ({ status, priority }: Pick<UseInboxUrlQuery, 'status' | 'priority'>) => {
    setSearchQuery((prev) => ({ ...prev, priority, status }));
  };

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
            setSearch(draftSearch);
          }}
          onBlur={(event) => {
            event.preventDefault();
            setSearch(draftSearch);
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
                setSearch('');
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
              setSearch(draftSearch);
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
          setFilters({ priority: v?.map(String), status: filter.status });
        }}
      />

      <TaskStatusSelect
        values={filter.status}
        onChange={(value) => {
          setFilters({ priority: filter.priority?.map(String), status: value });
        }}
      />
    </div>
  );
});

export { InboxManipulationBlock };
