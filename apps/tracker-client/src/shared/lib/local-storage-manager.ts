import z, { ZodType, ZodObject, ZodBoolean } from 'zod';
import type { ValueOf } from './type-helpers';

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
    : z.infer<ParseSchema> {
    const value = this.storage.getItem(key);
    if (this.schema.shape[key] instanceof ZodBoolean && value === 'false') {
      return false as z.infer<TSchema>[TKey];
    }
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
