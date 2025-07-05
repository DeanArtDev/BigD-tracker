import { CreateTemplateReq, CreateTemplateRes } from './dtos';

export namespace TrainingCreateTemplate {
  export const pattern = 'training.create-template.command';
  export class Request extends CreateTemplateReq {}
  export class Response extends CreateTemplateRes {}
}
