type OmitUndefinedResult<T extends object> = {
  [Key in keyof T]?: Exclude<T[Key], undefined>;
};

function omitUndefined<T extends object>(input: T): OmitUndefinedResult<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as OmitUndefinedResult<T>;
}

export { omitUndefined, OmitUndefinedResult };
