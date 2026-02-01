import { Button } from '@/shared/ui-kit/ui/button';
import { Plus } from 'lucide-react';
import type { ComponentProps } from 'react';

type ButtonAddProps = Omit<ComponentProps<typeof Button>, 'children'>;

function ButtonAdd(props: ButtonAddProps) {
  return (
    <Button size="icon" variant="outline" type="button" {...props}>
      <Plus className="size-5" />
    </Button>
  );
}

export { ButtonAdd, type ButtonAddProps };
