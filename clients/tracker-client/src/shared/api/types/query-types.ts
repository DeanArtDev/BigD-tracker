interface QuerySelectResponse<TData extends Record<string, unknown>> {
  readonly items: TData[];
  readonly byId: Record<number, TData>;
}

export type { QuerySelectResponse };
