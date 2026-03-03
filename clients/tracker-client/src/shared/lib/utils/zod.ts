import dayjs from '../time';

const formPlaceholderValues = {
  number: NaN,
  string: '',
  date: null,
  textInputs: undefined,
};

const transformPlaceholder = {
  number: (value: number | null | undefined): number =>
    value == null ? formPlaceholderValues.number : value,

  percentNumber: (value: number | null | undefined): number => {
    if (value == null) return formPlaceholderValues.number;
    return value < 1 ? value * 100 : value;
  },

  string: (value: string | null | undefined): string =>
    value == null ? formPlaceholderValues.string : value,

  optional: <T>(value: T): T | undefined => (value == null || value === '' ? undefined : value),

  isoDate: (value: Date | string | null | undefined): string | undefined =>
    value == null ? undefined : new Date(value).toISOString(),
};

const formTransform = {
  dateToEndDay: (value: Date | string | null | undefined): Date | undefined => {
    if (value == null) return undefined;
    return dayjs(value).endOf('day').toDate();
  },

  dateToStartDay: (value: Date | string | null | undefined): Date | undefined => {
    if (value == null) return undefined;
    return dayjs(value).startOf('day').toDate();
  },

  dateToISOSFormat: (value: Date | string | null | undefined): string | undefined =>
    value == null ? undefined : new Date(value).toISOString(),

  toNumber: (value: unknown): number | undefined => {
    const v = Number(value);
    if (Number.isFinite(v)) return v;
    return undefined;
  },
};

export { transformPlaceholder, formPlaceholderValues, formTransform };
