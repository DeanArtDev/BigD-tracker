import { GetTrainingTemplatesReq, GetTrainingTemplatesRes } from './dtos';

export namespace TrainingGetTrainingTemplates {
  export const pattern = 'training.training-templates.query';
  export class Request extends GetTrainingTemplatesReq {}
  export class Response extends GetTrainingTemplatesRes {}
}
