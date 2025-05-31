import { mapExerciseType } from '@/entity/exercises/lib/constants';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui-kit/ui/form';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui-kit/ui/select';
import { upperFirst } from 'lodash-es';

const entries = Object.entries(mapExerciseType);

function ExerciseTypeSelectForm(props: { name?: string; required?: boolean }) {
  const { name = 'type', required = false } = props;

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="grow">
          <FormLabel>
            <RequiredSign on={required}>Тип</RequiredSign>
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="Какой тип?" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {entries.map(([key, value]) => {
                return (
                  <SelectItem key={key} value={key}>
                    {upperFirst(value)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { ExerciseTypeSelectForm };
