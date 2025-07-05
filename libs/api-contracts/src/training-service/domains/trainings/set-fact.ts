import { SetFactReq, SetFactRes } from './dtos';

export namespace TrainingSetFact {
  export const pattern = 'training.set-fact.command';
  export class Request extends SetFactReq {}
  export class Response extends SetFactRes {}
}
