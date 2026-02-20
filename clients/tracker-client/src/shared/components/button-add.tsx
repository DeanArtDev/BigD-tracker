import { cn } from '@/shared/ui-kit/utils';
import { ButtonLoading, type ButtonLoadingProps } from './button-loading';
import { type LucideProps, Plus } from 'lucide-react';

type ButtonAddProps = ButtonLoadingProps & {
  readonly iconProps?: Omit<LucideProps, 'ref'>;
};

function ButtonAdd({ iconProps, ...props }: ButtonAddProps) {
  return (
    <ButtonLoading size="icon" variant="outline" type="button" {...props}>
      <Plus {...iconProps} className={cn('size-5', iconProps?.className)} />
    </ButtonLoading>
  );
}

export { ButtonAdd, type ButtonAddProps };
