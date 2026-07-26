import { useQuery } from '@apollo/client/react';
import { Brand } from '@/shared/lib';
import { shapeGetPlannerInitOptions } from '../shape-get-planner-init.options';

function usePlannerInit<BrandGroup extends Brand<number, string>>() {
  const result = useQuery(...shapeGetPlannerInitOptions<BrandGroup>().query());

  const initialLoading = result.networkStatus === 1 && result.data == null;

  return {
    ...result,
    initialLoading,
    data:
      result?.data != null
        ? {
            inbox: {
              id: result.data?.getPlannerInit.inboxId,
              taskCount: result.data?.getPlannerInit.inboxTaskCount,
            },
          }
        : null,
  };
}

export { usePlannerInit };
