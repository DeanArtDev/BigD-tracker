import { z } from 'zod';

class CursorPagination {
  static decode<TSchema extends z.ZodObject<{ [key: string]: z.ZodType }>>(
    cursor: string,
    schema: TSchema,
  ): z.infer<TSchema> | undefined {
    const jsonString = Buffer.from(cursor, 'base64').toString('utf-8');

    try {
      const json = JSON.parse(jsonString);
      const response = schema.safeParse(json);
      if (response.success) return response.data;
    } catch {
      return undefined;
    }

    return undefined;
  }

  static encode<TSchema extends z.ZodObject<{ [key: string]: z.ZodType }>>(
    payload: z.infer<TSchema>,
  ): string {
    const json = JSON.stringify(payload);
    return Buffer.from(json, 'utf8').toString('base64');
  }
}

export { CursorPagination };
