import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { CursorPagination } from './cursor-pagination';

const cursorSchema = z.object({
  lastId: z.number().or(z.string()).optional(),
  search: z.string().optional(),
  sort: z.array(z.string()).optional(),
  filter: z.record(z.string(), z.unknown()).optional(),
});

type CursorPayload = z.infer<typeof cursorSchema> & {
  readonly limit?: number;
  readonly currentPartLength: number;
};

/*TODO:
 *  [] add optimization equal payloads with cursor */
@Injectable()
export class CursorPaginationService {
  public getNextCursor(payload: CursorPayload): { nextCursor?: string; hasNext: boolean } {
    const { lastId, sort, search, filter, limit, currentPartLength } = payload;
    if (lastId == null) return { nextCursor: undefined, hasNext: false };
    if ((limit ?? 0) > currentPartLength) return { nextCursor: undefined, hasNext: false };

    const nextCursor = CursorPagination.encode({ lastId, sort, search, filter });
    return { nextCursor, hasNext: nextCursor != null };
  }

  public decodeCursorString(cursor?: string): z.infer<typeof cursorSchema> | undefined {
    if (cursor == null) return undefined;
    return CursorPagination.decode(cursor, cursorSchema);
  }
}
