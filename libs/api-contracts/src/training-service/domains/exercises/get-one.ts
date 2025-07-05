import { GetOneExerciseReq, GetOneExerciseRes } from './dtos';

export namespace TrainingGetOneExercise {
  export const pattern = 'training.one-exercise.query';
  export class Request extends GetOneExerciseReq {}
  export class Response extends GetOneExerciseRes {}
}
