import { Brand, Override } from '@/shared/lib';
import { AppMutationOptionsResponse } from '../../../types';
import { UpdateTaskDocument, UpdateTaskMutationVariables, UpdateTaskMutation } from '../schemas';

type BrandedUpdateTaskMutation<
  BrandTask extends Brand<string, string>,
  BrandGroup extends Brand<number, string>,
> = Override<
  UpdateTaskMutation,
  { updateTask: Override<UpdateTaskMutation['updateTask'], { id: BrandTask; groupId?: BrandGroup }> }
>;
type OptionsResponse<
  BrandTask extends Brand<string, string>,
  BrandGroup extends Brand<number, string>,
> = AppMutationOptionsResponse<BrandedUpdateTaskMutation<BrandTask, BrandGroup>, UpdateTaskMutationVariables>;

function shapeTaskUpdateOptions<BrandTask extends Brand<string, string>, BrandGroup extends Brand<number, string>>(
  additionalOptions?: Partial<OptionsResponse<BrandTask, BrandGroup>[1]>,
): OptionsResponse<BrandTask, BrandGroup> {
  const options: OptionsResponse<BrandTask, BrandGroup>[1] = {
    ...additionalOptions,
    context: {
      ...additionalOptions?.context,
      endpoint: 'private',
    },
  };

  return [UpdateTaskDocument, options];
}

shapeTaskUpdateOptions.document = UpdateTaskDocument;

export { shapeTaskUpdateOptions, type BrandedUpdateTaskMutation };
