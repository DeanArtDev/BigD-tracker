const zodPlaceholder = {
  number: NaN,
  string: '',
};

const transformPlaceholder = {
  number: (value: number | null | undefined) => (value == null ? zodPlaceholder.number : value),
  string: (value: string | null | undefined) => (value == null ? zodPlaceholder.string : value),
  optional: <T>(value: T) => (value == null || value === '' ? undefined : value),
};

export { transformPlaceholder, zodPlaceholder };
