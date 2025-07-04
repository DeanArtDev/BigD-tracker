import { DeleteExerciseReq, DeleteExerciseRes } from './dtos';

export namespace TrainingDeleteExercise {
  export const pattern = 'training.delete.command';
  export class Request extends DeleteExerciseReq {}
  export class Response extends DeleteExerciseRes {}
}
