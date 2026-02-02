import { InputNumberForm } from '@/shared/components/form';
import type { ReactNode } from 'react';
import type { FieldValues, Path } from 'react-hook-form';

interface RepetitionFormProps<FormValues extends FieldValues = FieldValues> {
  readonly index?: number;
  readonly weightName: Path<FormValues>;
  readonly countName: Path<FormValues>;
  readonly breakName: Path<FormValues>;
  readonly appendSlot?: ReactNode;
}

function RepetitionForm<FormValues extends FieldValues = FieldValues>({
  weightName,
  countName,
  breakName,
  appendSlot,
  index = -1,
}: RepetitionFormProps<FormValues>) {
  return (
    <li className="flex gap-2 grow items-center text-sm">
      {index !== -1 && <span className="ml-3 mr-auto mb-auto mt-2">{index + 1}.</span>}

      <div className="flex gap-2 grow items-center flex-wrap justify-end ">
        <div className="grid grid-cols-[max-content_80px] gap-2 items-center justify-center">
          <span>Вес</span>
          <InputNumberForm<FormValues>
            classNames={{ input: 'px-1 text-center' }}
            name={weightName}
          />
        </div>

        <div className="grid grid-cols-[max-content_60px] gap-2 items-center justify-center">
          <span>Повторения</span>
          <InputNumberForm<FormValues>
            classNames={{ input: 'px-1 text-center' }}
            name={countName}
          />
        </div>

        <div className="grid grid-cols-[max-content_60px] gap-2 items-center justify-center">
          <span>Перерыв мин.</span>
          <InputNumberForm<FormValues>
            classNames={{ input: 'px-1 text-center' }}
            name={breakName}
          />
        </div>
      </div>

      {appendSlot}
    </li>
  );
}

export { RepetitionForm, type RepetitionFormProps };
