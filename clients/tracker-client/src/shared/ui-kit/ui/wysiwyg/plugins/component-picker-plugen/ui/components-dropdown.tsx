import { cn } from '@/shared/ui-kit/utils';
import { type ComponentPickerOption } from '../option-model';

interface ComponentsDropdownItemProps {
  readonly index: number;
  readonly isSelected: boolean;
  readonly option: ComponentPickerOption;
  readonly onClick: () => void;
  readonly onMouseEnter: () => void;
}

function ComponentsDropdownItem({
  isSelected,
  index,
  onMouseEnter,
  option,
  onClick,
}: ComponentsDropdownItemProps) {
  return (
    <li
      className={cn('inline-flex grow gap-2 rounded h-9 w-full cursor-pointer p-1.5', {
        'bg-gray-200': isSelected,
      })}
      key={option.key}
      tabIndex={-1}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <span>{option.icon}</span>

      <h5>{option.title}</h5>
    </li>
  );
}

export { ComponentsDropdownItem, type ComponentsDropdownItemProps };
