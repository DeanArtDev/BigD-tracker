import { GetOneTemplatesReq, GetOneTemplatesRes } from './dtos';

export namespace TrainingGetOneTemplate {
  export const pattern = 'training.get-one-template.query';
  export class Request extends GetOneTemplatesReq {}
  export class Response extends GetOneTemplatesRes {}
}
