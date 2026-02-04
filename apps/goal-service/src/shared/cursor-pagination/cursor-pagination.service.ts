import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { CursorPagination } from './cursor-pagination';

const cursorSchema = z.object({
  lastId: z.number().optional(),
  search: z.string().optional(),
  sort: z.array(z.string()).optional(),
  filter: z.array(z.string()).optional(),
});

type CursorPayload = z.infer<typeof cursorSchema> & {
  readonly limit?: number;
  readonly currentPartLength: number;
};

@Injectable()
export class CursorPaginationService {
  public getNextCursor(
    cursor: string | undefined,
    payload: CursorPayload,
  ): { nextCursor?: string } {
    const { lastId, sort, search, filter, limit, currentPartLength } = payload;

    const nextCursor = CursorPagination.encode({ lastId, sort, search, filter });
    if (cursor == null) return { nextCursor };

    const lastPart = (limit ?? 0) > currentPartLength;
    const nc = lastId != null && !lastPart ? nextCursor : undefined;

    return { nextCursor: nc };
  }

  public decodeCursorString(cursor?: string): z.infer<typeof cursorSchema> | undefined {
    if (cursor == null) return undefined;
    return CursorPagination.decode(cursor, cursorSchema);
  }
}
