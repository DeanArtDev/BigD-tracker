import { Injectable } from '@nestjs/common';

@Injectable()
export class RmqLoggerDeserializer {
  constructor(private readonly options: { fullLog?: boolean } = { fullLog: false }) {}

  deserialize(value: any) {
    console.dir(value, {
      depth: this.options.fullLog ? null : 2,
      colors: true,
    });
    return value;
  }
}
