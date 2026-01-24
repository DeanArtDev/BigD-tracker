import dayjs from '../time';

const zodPlaceholder = {
  number: NaN,
  string: '',
};

const transformPlaceholder = {
  number: (value: number | null | undefined): number =>
    value == null ? zodPlaceholder.number : value,

  string: (value: string | null | undefined): string =>
    value == null ? zodPlaceholder.string : value,

  optional: <T>(value: T): T | undefined => (value == null || value === '' ? undefined : value),

  isoDate: (value: Date | string | null | undefined): string | undefined =>
    value == null ? undefined : new Date(value).toISOString(),

  endDate: (value: Date | string | null | undefined): Date | undefined =>
    value == null ? undefined : dayjs(value).endOf('day').toDate(),
};

export { transformPlaceholder };
