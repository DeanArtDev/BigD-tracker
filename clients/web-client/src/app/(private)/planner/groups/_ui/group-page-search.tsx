import { AppSearchInput } from '@/shared/project-ui';
import { useGroupListUrlQuery } from '../_model/use-group-list-url-query';

function GroupPageSearch() {
  const [searchQuery, setSearchQuery] = useGroupListUrlQuery();

  return (
    <AppSearchInput
      value={searchQuery?.search}
      placeholder="Поиск по имени группы..."
      onSearch={(search) => setSearchQuery({ search })}
    />
  );
}

export { GroupPageSearch };
