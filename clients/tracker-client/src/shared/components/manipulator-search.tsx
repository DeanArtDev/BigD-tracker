import { ButtonLoading } from '@/shared/components/button-loading';
import { Button } from '@/shared/ui-kit/ui/button';
import { Field } from '@/shared/ui-kit/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui-kit/ui/input-group';
import { cn } from '@/shared/ui-kit/utils';
import { isEmpty } from 'lodash-es';
import { SearchIcon, X } from 'lucide-react';
import { useRef } from 'react';

interface ManipulatorSearchProps {
  readonly search: string | undefined;
  readonly open: boolean;
  readonly className?: string;
  readonly placeholder?: string;
  readonly loading?: boolean;
  readonly onOpenChange: (value: boolean) => void;
  readonly onSearchChange: (value: string | undefined) => void;
}

function ManipulatorSearch({
  search,
  open,
  loading,
  placeholder,
  className,
  onOpenChange,
  onSearchChange,
}: ManipulatorSearchProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const hasValue = !isEmpty(search);

  return (
    <>
      <Field
        className={cn(
          'absolute',
          'bg-background rounded-md h-auto',
          'origin-left scale-x-0 opacity-0 pointer-events-none',
          'transition-[transform,scale,opacity] duration-400 ease-out',
          open && 'scale-x-100 opacity-100 pointer-events-auto',
          className,
        )}
      >
        <InputGroup className="grow">
          <InputGroupInput
            ref={searchRef}
            value={search ?? ''}
            placeholder={placeholder}
            onChange={(evt) => {
              const value = evt.target.value.trim() === '' ? undefined : evt.target.value;
              onSearchChange(value);
            }}
          />
          <InputGroupAddon align="inline-end">
            <ButtonLoading
              variant="ghost"
              className="hover:bg-transparent"
              size="icon-sm"
              disabled={!hasValue}
              hideContent
              isLoading={loading}
              onClick={() => void onSearchChange(undefined)}
            >
              <X className={cn({ 'stroke-black': hasValue })} />
            </ButtonLoading>
          </InputGroupAddon>
        </InputGroup>
      </Field>

      <Button
        variant={hasValue ? 'default' : 'outline'}
        size="icon-lg"
        onClick={() => {
          open ? searchRef.current?.blur() : searchRef.current?.focus();
          onOpenChange(!open);
        }}
      >
        {open ? <X className="size-6" /> : <SearchIcon className="size-6" />}
      </Button>
    </>
  );
}

export { ManipulatorSearch, type ManipulatorSearchProps };
