import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from './button';

type ButtonChevronProps = ComponentProps<typeof Button> & {
  readonly open?: boolean;
};

function ButtonChevron({ open = false, ...buttonProps }: ButtonChevronProps) {
  return (
    <Button type="button" variant="ghost" size="sm" {...buttonProps}>
      {open ? <ChevronUp /> : <ChevronDown />}
    </Button>
  );
}

export { ButtonChevron, type ButtonChevronProps };
