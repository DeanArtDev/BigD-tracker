import { UpdateTemplateReq, UpdateTemplateRes } from './dtos';

export namespace TrainingUpdateTemplate {
  export const pattern = 'training.update-template.command';
  export class Request extends UpdateTemplateReq {}
  export class Response extends UpdateTemplateRes {}
}
