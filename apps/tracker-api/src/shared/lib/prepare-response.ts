import { plainToInstance, ClassConstructor } from 'class-transformer';

type Response<T, C> = T extends T[]
  ? C[]
  : T extends null
    ? undefined
    : T extends undefined
      ? undefined
      : T extends Record<string, any>
        ? C
        : T;

function prepareResponse<T, C>(
  data: T,
  clsTransformer: ClassConstructor<C>,
): Response<T, C> {
  if (Array.isArray(data)) {
    return data.map((i) => plainToInstance(clsTransformer, i)) as any;
  }

  if (data == null) {
    return undefined as any;
  }

  if (typeof data === 'object') {
    return plainToInstance(clsTransformer, data) as any;
  }

  return data as any;
}

export { prepareResponse };
