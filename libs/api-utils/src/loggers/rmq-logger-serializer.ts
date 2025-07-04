import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class RmqLoggerSerializer {
  constructor(private readonly options: { fullLog?: boolean } = { fullLog: false }) {}

  serialize(response: any) {
    let result = response;
    if ('response' in response && response.response != null && 'data' in response.response) {
      result = { data: instanceToPlain(response.response.data, { exposeUnsetFields: false }) };
    }

    console.dir(result, { depth: this.options.fullLog ? null : 2, colors: true });
    return result;
  }
}
