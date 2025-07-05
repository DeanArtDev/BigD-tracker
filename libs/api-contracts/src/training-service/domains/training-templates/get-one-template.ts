import { GetOneTemplateReq, GetOneTemplateRes } from './dtos';

export namespace TrainingGetOneTemplate {
  export const pattern = 'training.one-template.query';
  export class Request extends GetOneTemplateReq {}
  export class Response extends GetOneTemplateRes {}
}
