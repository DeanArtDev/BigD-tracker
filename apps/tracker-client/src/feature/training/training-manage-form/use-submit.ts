import {
  useTrainingsTemplateByIdQuery,
  useTrainingTemplateCreate,
  useTrainingTemplateUpdate,
} from '@/entity/training-templates';
import type { ApiDto } from '@/shared/api/types';
import type { SubmitFormData } from './training-template-manage-form';

interface UseSubmitParams {
  readonly templateId?: number;
  readonly onSuccess: () => void;
}

function useSubmit({ templateId, onSuccess }: UseSubmitParams) {
  const { createTrainingTemplates, isPending: isCreating } = useTrainingTemplateCreate();
  const { updateTrainingTemplates, isPending: isUpdating } = useTrainingTemplateUpdate();
  const { trainingTemplate, isLoading: isTrainingTemplateLoading } = useTrainingsTemplateByIdQuery({
    templateId,
  });

  return {
    trainingTemplate,
    isLoading: isCreating || isUpdating || isTrainingTemplateLoading,
    handleSubmitForm: (formData: SubmitFormData) => {
      if (trainingTemplate != null) {
        const updateRequestData: ApiDto['UpdateTrainingTemplateWithExerciseRequest']['data'] = {
          type: formData.type,
          description: formData.description,
          name: formData.name,
          postTrainingDuration: formData.postTrainingDuration,
          wormUpDuration: formData.wormUpDuration,
          exercises: formData.exercises.map((exercise) => {
            return {
              ...exercise,
              repetitions: exercise.repetitions.map((rep) => {
                return {
                  id: rep.id,
                  targetCount: rep.targetCount,
                  targetWeight: rep.targetWeight.toString(),
                  targetBreak: rep.targetBreak,
                };
              }),
            };
          }),
        };

        updateTrainingTemplates(
          {
            params: { path: { templateId: trainingTemplate.id } },
            body: { data: updateRequestData },
          },
          { onSuccess },
        );
        return;
      }

      const createRequestData: ApiDto['CreateTrainingTemplateWithExercisesRequestData'] = {
        type: formData.type,
        description: formData.description,
        name: formData.name,
        postTrainingDuration: formData.postTrainingDuration,
        wormUpDuration: formData.wormUpDuration,
        exercises: formData.exercises.map((exercise) => {
          return {
            ...exercise,
            repetitions: exercise.repetitions.map((rep) => {
              return {
                id: rep.id,
                targetCount: rep.targetCount,
                targetWeight: rep.targetWeight.toString(),
                targetBreak: rep.targetBreak,
              };
            }),
          };
        }),
      };

      createTrainingTemplates(
        {
          body: {
            data: createRequestData,
          },
        },
        { onSuccess },
      );
    },
  };
}

export { useSubmit, type UseSubmitParams };
