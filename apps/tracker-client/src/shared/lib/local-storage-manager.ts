import z, { ZodType, ZodObject } from 'zod';

export type ValueOf<Type> = Type[keyof Type];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class LocalStorageManager<TSchema extends ZodObject<any>> {
  private readonly schema: TSchema;
  private readonly storage: Storage;

  constructor(schema: TSchema, storage: Storage = localStorage) {
    this.storage = storage;
    this.schema = schema;
  }

  validate<TKey extends keyof TSchema['shape'] & string>(
    key: TKey,
    value: unknown,
  ): z.infer<TSchema>[TKey] | undefined {
    return this.schema.shape[key].safeParse(value);
  }

  setValue(key: string, value: ValueOf<z.infer<TSchema>>) {
    this.storage.setItem(key, value);
  }

  removeValue(key: keyof TSchema['shape'] & string) {
    this.storage.removeItem(key);
  }

  getValue<TKey extends keyof TSchema['shape'] & string, ParseSchema extends ZodType>(
    key: TKey,
    stringParseSchema?: ParseSchema,
  ): undefined | ParseSchema extends undefined
    ? z.infer<TSchema>[TKey] | undefined
    : z.infer<ParseSchema> | undefined {
    const value = this.storage.getItem(key);
    const result = this.schema.shape[key].safeParse(value);
    if (result.success) {
      if (stringParseSchema != null) {
        const d = stringParseSchema.safeParse(JSON.parse(result.data));
        return d.success ? d.data : undefined;
      }
      return result.data;
    }
    return undefined;
  }
}

export { LocalStorageManager };
