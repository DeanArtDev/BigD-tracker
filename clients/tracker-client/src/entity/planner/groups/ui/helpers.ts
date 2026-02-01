import { CircleCheckBig, CirclePause, ClockFading, type LucideProps } from 'lucide-react';
import { type ForwardRefExoticComponent } from 'react';
import type { GroupStatus } from '../model';

const GroupStatusToIconMap: Record<
  GroupStatus,
  ForwardRefExoticComponent<Omit<LucideProps, 'ref'>>
> = {
  NOT_STARTED: CirclePause,
  IN_PROGRESS: ClockFading,
  DONE: CircleCheckBig,
};

export { GroupStatusToIconMap };
