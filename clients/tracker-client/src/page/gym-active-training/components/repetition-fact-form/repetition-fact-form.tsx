import type { ApiDto } from '@/shared/api/types';
import { InputNumberForm } from '@/shared/components/form';
import { Button } from '@/shared/ui-kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui-kit/ui/form';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui-kit/ui/toggle-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ban, Flame, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';

interface RepetitionFactFormProps {
  readonly repetition: { targetCount: number; targetWeight: number; targetBreak: number };
  readonly onSuccess: (data: {
    finishType: ApiDto['RepetitionDto']['finishType'] & string;
    factCount: number;
    factWeight: number;
  }) => void;
}

const finishType: (ApiDto['RepetitionDto']['finishType'] & string)[] = [
  'DONE',
  'SKIP',
  'TRIED',
  'OVER',
];

const requiredMessage = 'Обязательное поле';
const validationSchema = z.object({
  finishType: z.enum(finishType, { message: requiredMessage }),

  factCount: z
    .number({ error: requiredMessage })
    .int({ message: 'Значение должно быть целым' })
    .gte(1, { message: 'Значение не может быть меньше 1' })
    .lte(300, { message: 'Значение не может быть больше 300' }),

  factWeight: z
    .number({ error: requiredMessage })
    .gte(1, { message: 'Значение не может быть меньше 1' })
    .lte(999.99, { message: 'Значение не может быть больше 999.99' }),
});

type RepetitionFactFormData = z.input<typeof validationSchema>;
type SubmitFormData = z.output<typeof validationSchema>;

function RepetitionFactForm({ repetition, onSuccess }: RepetitionFactFormProps) {
  const form = useForm<RepetitionFactFormData, any, SubmitFormData>({
    resolver: zodResolver(validationSchema),
    reValidateMode: 'onChange',
    values: {
      finishType: 'DONE',
      factCount: repetition.targetCount,
      factWeight: repetition.targetWeight,
    },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="space-y-8 flex flex-col grow w-full justify-start p-2.5 sm:p-4"
        onSubmit={form.handleSubmit((formData) => {
          onSuccess({
            factCount: formData.factCount,
            factWeight: formData.factWeight,
            finishType: formData.finishType,
          });
        })}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[max-content_60px] gap-2 items-center justify-end">
            <span>Вес</span>
            <InputNumberForm classNames={{ input: 'px-1 text-center' }} name="factWeight" />
          </div>

          <div className="grid grid-cols-[max-content_60px] gap-2 items-center justify-end">
            <span>Повторения</span>
            <InputNumberForm classNames={{ input: 'px-1 text-center' }} name="factCount" />
          </div>

          <FormField
            name="finishType"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <RequiredSign>Как получилось?</RequiredSign>
                  </FormLabel>

                  <FormControl>
                    <ToggleGroup
                      size="lg"
                      variant="outline"
                      type="single"
                      onValueChange={(value) => {
                        if (value.trim() !== '') field.onChange(value);
                      }}
                      {...field}
                    >
                      <ToggleGroupItem className="w-[250px]" value="SKIP">
                        <Ban color="var(--color-red-500)" />
                      </ToggleGroupItem>

                      <ToggleGroupItem value="TRIED">
                        <ThumbsDown color="var(--color-yellow-500)" />
                      </ToggleGroupItem>

                      <ToggleGroupItem value="DONE">
                        <ThumbsUp color="var(--color-green-500)" />
                      </ToggleGroupItem>

                      <ToggleGroupItem value="OVER">
                        <Flame color="var(--color-purple-500)" fill="var(--color-primary)" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <Button className="ml-auto mt-auto" type="submit" disabled={!form.formState.isValid}>
          Все по факту!
        </Button>
      </form>
    </Form>
  );
}

export { RepetitionFactForm, type RepetitionFactFormProps };
