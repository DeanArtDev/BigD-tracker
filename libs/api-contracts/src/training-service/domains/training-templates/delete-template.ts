import { DeleteTemplateRes, DeleteTemplateReq } from './dtos';

export namespace TrainingDeleteTemplate {
  export const pattern = 'training.delete-template.command';
  export class Request extends DeleteTemplateReq {}
  export class Response extends DeleteTemplateRes {}
}
