import { useTrainingTemplateCreate, useTrainingTemplateUpdate } from '@/entity/training-templates';
import type { TrainingManageFormData } from './training-template-manage-form';

interface UseSubmitParams {
  readonly templateId?: number;
  readonly onSuccess: () => void;
}

function useSubmit({ templateId, onSuccess }: UseSubmitParams) {
  const { createTrainingTemplates, isPending: isCreating } = useTrainingTemplateCreate();
  const { updateTrainingTemplates, isPending: isUpdating } = useTrainingTemplateUpdate();

  return {
    isLoading: isCreating || isUpdating,
    handleSubmitForm: (formData: TrainingManageFormData) => {
      const exercises = formData.exerciseList.map((e) => ({
        id: e.id,
        sets: e.sets,
        repetitions: e.repetitions,
      }));

      if (templateId != null) {
        updateTrainingTemplates(
          {
            body: {
              data: [
                {
                  id: templateId,
                  exercises,
                  type: formData.type,
                  name: formData.name,
                  description: formData.description,
                  wormUpDuration: formData.wormUpDuration,
                  postTrainingDuration: formData.postTrainingDuration,
                },
              ],
            },
          },
          { onSuccess },
        );
        return;
      }

      createTrainingTemplates(
        {
          body: {
            data: [
              {
                exercises,
                type: formData.type,
                name: formData.name,
                description: formData.description,
                wormUpDuration: formData.wormUpDuration,
                postTrainingDuration: formData.postTrainingDuration,
              },
            ],
          },
        },
        { onSuccess },
      );
    },
  };
}

export { useSubmit, type UseSubmitParams };
