import { GetTrainingTemplatesReq, GetTrainingTemplatesRes } from './dtos';

export namespace TrainingGetTrainingTemplates {
  export const pattern = 'training.templates.query';
  export class Request extends GetTrainingTemplatesReq {}
  export class Response extends GetTrainingTemplatesRes {}
}
