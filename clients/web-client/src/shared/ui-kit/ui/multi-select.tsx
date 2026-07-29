import { Check, ChevronsUpDown } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { FilterResetButton } from './filter-reset-button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface Option<Value extends string = string> {
  readonly label: string;
  readonly value: Value;
}

interface MultiSelectProps<Value extends string = string> {
  readonly options: Option<Value>[];
  readonly value: Value[];
  readonly onChange: (value: Value[]) => void;
  readonly placeholder?: string;
}

function MultiSelect<Value extends string = string>({
  placeholder,
  options,
  value,
  onChange,
}: MultiSelectProps<Value>) {
  const toggleValue = (optionValue: Value) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }

    onChange([...value, optionValue]);
  };

  const selectedOptions = options.filter((option) => value.includes(option.value));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button type="button" variant="outline" className="text-muted-foreground">
            {placeholder}

            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>

          <div className="flex flex-wrap gap-1 group absolute size-5 top-[-10px] right-[-10px] items-center justify-center">
            {selectedOptions.length > 0 ? (
              <>
                <FilterResetButton
                  className="hidden justify-center group-hover:flex"
                  onReset={() => {
                    onChange([]);
                  }}
                />
                <Badge className="group-hover:hidden rounded-xl size-5">{selectedOptions.length}</Badge>
              </>
            ) : null}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent className="p-1 gap-1">
        {options.map((option) => {
          const isSelected = value.includes(option.value);

          return (
            <Button
              className="flex justify-between w-full"
              type="button"
              variant={isSelected ? 'secondary' : 'ghost'}
              key={option.value}
              value={option.label}
              onClick={() => {
                toggleValue(option.value);
              }}
            >
              {option.label}
              {isSelected && <Check className="size-4" />}
            </Button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect, type MultiSelectProps };
