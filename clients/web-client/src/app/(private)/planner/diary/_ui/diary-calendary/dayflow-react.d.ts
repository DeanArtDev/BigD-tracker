import type { ReactNode } from 'react';

declare module '@dayflow/react' {
  interface DayFlowCalendarProps {
    yearViewModeTabs?: () => ReactNode;
  }
}
