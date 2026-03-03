import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui-kit/ui/select';

function TrainingTypeSelectForm(props: { disabled?: boolean }) {
  return (
    <FormField
      name="type"
      render={({ field }) => {
        return (
          <FormItem className="grow">
            <FormLabel>
              <RequiredSign>Тип</RequiredSign>
            </FormLabel>
            <Select disabled={props.disabled} onValueChange={field.onChange} value={field.value}>
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
        );
      }}
    />
  );
}

export { TrainingTypeSelectForm };
