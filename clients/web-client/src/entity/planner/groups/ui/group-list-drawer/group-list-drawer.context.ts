'use client';

import { createStrictContext, MaybePromise, useStrictContext } from '@/shared/lib';
import { GroupId, GroupInfo } from '../../model';

type ConsumerCb = (selectedGroupInfo: GroupInfo) => MaybePromise<void>;
type OpenGroupListHandlerParams = { readonly cb: ConsumerCb; readonly selectedGroupIds: GroupId[] };

interface GroupListDrawerContext {
  readonly openGroupList: (params: OpenGroupListHandlerParams) => void;
}

const groupListDrawerContext = createStrictContext<GroupListDrawerContext>();

const useGroupListDrawerContext = () => useStrictContext<GroupListDrawerContext>(groupListDrawerContext);

export {
  groupListDrawerContext,
  useGroupListDrawerContext,
  type GroupListDrawerContext,
  type ConsumerCb,
  type OpenGroupListHandlerParams,
};
