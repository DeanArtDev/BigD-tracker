import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button, InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui-kit';
import { useGroupListUrlQuery } from '../_model/use-group-list-url-query';

function GroupPageSearch() {
  const [searchQuery, setSearchQuery] = useGroupListUrlQuery();

  const [draftSearch, setDraftSearch] = useState(searchQuery?.search ?? '');

  return (
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
          setSearchQuery({ search: draftSearch });
        }}
        onBlur={(event) => {
          event.preventDefault();
          setSearchQuery({ search: draftSearch });
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
              setSearchQuery({ search: undefined });
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
            setSearchQuery({ search: draftSearch });
          }}
        >
          <Search />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { GroupPageSearch };
