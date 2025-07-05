import { CreateTrainingByTemplateReq, CreateTrainingByTemplateRes } from './dtos';

export namespace TrainingCreateTrainingByTemplate {
  export const pattern = 'training.create-training-by-template.command';
  export class Request extends CreateTrainingByTemplateReq {}
  export class Response extends CreateTrainingByTemplateRes {}
}
