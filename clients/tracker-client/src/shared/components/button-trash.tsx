import { ButtonLoading, type ButtonLoadingProps } from './button-loading';
import { Trash } from 'lucide-react';

type ButtonTrashProps = Omit<ButtonLoadingProps, 'children'>;

function ButtonTrash({ isLoading, ...props }: ButtonTrashProps) {
  return (
    <ButtonLoading
      size="icon"
      isLoading={isLoading}
      variant="ghost"
      onClick={(evt) => void evt.stopPropagation()}
      {...props}
    >
      <Trash />
    </ButtonLoading>
  );
}

export { ButtonTrash, type ButtonTrashProps };
