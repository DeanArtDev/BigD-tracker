import { useGroupInvalidate, useGroupsQuery } from '@/entity/planner/groups';
import { GroupDelete } from '@/entity/planner/groups/ui';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { Trash } from 'lucide-react';
import { GroupAdd } from './components/group-add';
import { GroupCart } from './components/group-cart';

/* TODO:
 *   [] dnd
 *   [] новая страница группы
 *   [] удаление для мобилки свайп
 *   []
 *   []
 * */

function GroupListPage() {
  const { groups, isLoading } = useGroupsQuery();
  const isMobile = useIsMobile();
  const groupInvalidate = useGroupInvalidate();

  return (
    <PageWrapper
      title="Группы"
      className="flex flex-col w-full grow sm:max-w-[80%] mx-auto gap-6 pb-10"
    >
      <DataLoader loadingElement={<AppLoader />} isLoading={isLoading}>
        <ul className="flex flex-col w-full gap-3">
          {groups?.map((group) => (
            <GroupCart
              key={group.id}
              groupId={group.id}
              name={group.name}
              description={group.description}
              onClick={console.log}
              beforeCollapseTriggerSlot={
                !isMobile && (
                  <GroupDelete
                    groupId={group.id}
                    onSuccess={async () => void (await groupInvalidate())}
                  >
                    {({ isLoading }) => (
                      <Button
                        size="icon"
                        className="opacity-0 group-hover/group-card:opacity-100"
                        disabled={isLoading}
                        variant="ghost"
                        onClick={(evt) => void evt.stopPropagation()}
                      >
                        <Trash />
                      </Button>
                    )}
                  </GroupDelete>
                )
              }
            />
          ))}
        </ul>

        <GroupAdd />
      </DataLoader>
    </PageWrapper>
  );
}

export const Component = GroupListPage;
