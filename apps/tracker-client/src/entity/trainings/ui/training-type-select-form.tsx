import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui-kit/ui/select';

function TrainingTypeSelectForm(props: { disabled?: boolean }) {
  return (
    <FormField
      name="type"
      render={({ field }) => (
        <FormItem className="grow">
          <FormLabel>Тип</FormLabel>
          <Select
            disabled={props.disabled}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="По тяжеленькой?" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              <SelectItem value="LIGHT">Легкая</SelectItem>
              <SelectItem value="MEDIUM">Средняя</SelectItem>
              <SelectItem value="HARD">Тяжелая</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { TrainingTypeSelectForm };
