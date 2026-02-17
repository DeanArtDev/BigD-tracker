import type { GroupStatus } from '@/entity/planner/groups';
import { GroupCreation } from '@/feature/planner/groups/group-creation';
import { ButtonAdd } from '@/shared/components/button-add';
import { InputForm } from '@/shared/components/form';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { Button } from '@/shared/ui-kit/ui/button';
import { Form } from '@/shared/ui-kit/ui/form';
import { SearchIcon, SlidersHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface GroupListHeaderProps {
  readonly onSearch: (search: string | undefined) => void;
  readonly onFilterChange?: (filters: { status: GroupStatus }) => void;
}

function GroupListHeader({ onSearch, onFilterChange }: GroupListHeaderProps) {
  const isMobile = useIsMobile();

  const form = useForm<{ searchString?: string }>({
    disabled: false,
    defaultValues: { searchString: undefined },
  });

  return (
    <div className="sticky top-0 z-50 bg-white group-list-header flex flex-wrap gap-2 md:gap-3 py-3 px-2 sm:px-0 mb-3 border-b">
      <div className="flex grow gap-2 md:gap-3 items-center">
        <Form {...form}>
          <form noValidate className="flex grow gap-2 md:gap-3">
            <InputForm
              name="searchString"
              classNames={{ wrapper: 'grow' }}
              placeholder="Найти группы..."
            />

            <Button
              variant="outline"
              aria-label="Поиск"
              disabled={form.formState.disabled}
              onClick={form.handleSubmit((successFormData) => {
                onSearch(successFormData.searchString);
              })}
            >
              {isMobile ? <SearchIcon /> : 'Поиск'}
            </Button>
          </form>
        </Form>
      </div>

      <div className="flex w-full">
        <Button
          size="icon"
          variant="outline"
          onClick={() => void onFilterChange?.({ status: 'IN_PROGRESS' })}
        >
          <SlidersHorizontal />
        </Button>

        <GroupCreation>
          <ButtonAdd className="ml-auto" />
        </GroupCreation>
      </div>
    </div>
  );
}

export { GroupListHeader, type GroupListHeaderProps };
