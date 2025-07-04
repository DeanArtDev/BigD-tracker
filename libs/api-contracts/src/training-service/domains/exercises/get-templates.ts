import { GetExerciseTemplatesReq, GetExerciseTemplatesRes } from './dtos';

export namespace TrainingGetExerciseTemplates {
  export const pattern = 'training.exercise-templates.query';
  export class Request extends GetExerciseTemplatesReq {}
  export class Response extends GetExerciseTemplatesRes {}
}
