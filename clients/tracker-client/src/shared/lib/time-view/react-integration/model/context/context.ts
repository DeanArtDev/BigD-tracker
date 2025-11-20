import { createStrictContext, useStrictContext } from '@/shared/lib/react/strict-context';
import { TimeViewController } from '@/shared/lib/time-view/core';

const timeViewControllerContext = createStrictContext<TimeViewController>();

const useTimeViewController = <TExtra = any>() =>
  useStrictContext<TimeViewController<TExtra>>(timeViewControllerContext);

export { timeViewControllerContext, useTimeViewController };
