import { SetBreakFactRes, SetBreakFactReq } from './dtos';

export namespace TrainingSetBreakFact {
  export const pattern = 'training.set-break-fact.command';
  export class Request extends SetBreakFactReq {}
  export class Response extends SetBreakFactRes {}
}
