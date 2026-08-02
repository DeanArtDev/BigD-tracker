import type { ComponentProps } from 'react';
import type { Locale } from 'react-day-picker';
import type { Popover } from '@/shared/ui-kit';

interface DateAndTimePickerProps {
  readonly className?: string;
  readonly clearable?: boolean;
  readonly defaultTime?: {
    readonly hour: number;
    readonly minute: number;
  };
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly label?: string;
  readonly locale?: Partial<Locale>;
  readonly max?: Date;
  readonly min?: Date;
  readonly minuteStep?: number;
  readonly onChange: (value?: Date) => void;
  readonly popoverProps?: Omit<ComponentProps<typeof Popover>, 'open' | 'onOpenChange'>;
  readonly value?: Date | null | undefined;
}

export type { DateAndTimePickerProps };
