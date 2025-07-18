const zodPlaceholder = {
  number: NaN,
  string: '',
};

const transformPlaceholder = {
  number: (value: number | null | undefined) => (value == null ? zodPlaceholder.number : value),
  string: (value: string | null | undefined) => (value == null ? zodPlaceholder.string : value),
  optional: <T>(value: T) => (value == null || value === '' ? undefined : value),
  isoDate: (value: Date | string | null | undefined) =>
    value == null ? undefined : new Date(value).toISOString(),
};

export { transformPlaceholder, zodPlaceholder };
