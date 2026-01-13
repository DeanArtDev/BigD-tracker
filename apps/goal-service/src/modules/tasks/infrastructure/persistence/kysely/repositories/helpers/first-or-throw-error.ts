async function firstOrThrowError<T>(
  query: {
    executeTakeFirst(): Promise<T | undefined>;
    executeTakeFirstOrThrow(): Promise<T>;
  },
  { throwError }: { throwError?: boolean },
): Promise<T | null> {
  return throwError
    ? await query.executeTakeFirstOrThrow()
    : ((await query.executeTakeFirst()) ?? null);
}

export { firstOrThrowError };
