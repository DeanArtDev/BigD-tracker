import { usePlannerInit } from '@/entity/planner/init';

function useSidebarInfoQuerySuspense() {
  return usePlannerInit();
}

export { useSidebarInfoQuerySuspense };
