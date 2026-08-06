import { Brand, Override } from '@/shared/lib';
import { AppMutationOptionsResponse } from '../../../types';
import { CreateTaskDocument, CreateTaskMutationVariables, CreateTaskMutation } from '../schemas';

type BrandedCreateTaskMutation<BrandTask extends Brand<string, string>> = Override<
  CreateTaskMutation,
  { createTask: Override<CreateTaskMutation['createTask'], { id: BrandTask }> }
>;

type OptionsResponse<BrandTask extends Brand<string, string>> = AppMutationOptionsResponse<
  BrandedCreateTaskMutation<BrandTask>,
  CreateTaskMutationVariables
>;

function shapeTaskCreateOptions<BrandTask extends Brand<string, string>>(
  additionalOptions?: Partial<OptionsResponse<BrandTask>[1]>,
): OptionsResponse<BrandTask> {
  const options: OptionsResponse<BrandTask>[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
      retry: false,
    },
  };

  return [CreateTaskDocument, options];
}

shapeTaskCreateOptions.document = CreateTaskDocument;

export { shapeTaskCreateOptions };
