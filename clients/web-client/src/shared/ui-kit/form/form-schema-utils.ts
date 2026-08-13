import { timeAndDate } from '@big-d/time';

const schemaPlaceholderValues = {
  number: NaN,
  string: '',
  date: null,
  textInputs: undefined,
};

const formElementsValues = {
  inputPassword: { value: undefined, changeResult: null },
  inputText: { value: undefined, changeResult: null },
  textArea: { value: undefined, changeResult: null },
  toggleGroups: { value: '', changeResult: null },
  toggleGroupsMulti: { value: [], changeResult: [] },
  datePicker: { value: null, changeResult: null },
  wysiwyg: { value: undefined, changeResult: undefined },
  select: { value: '' },
};

const transformToPlaceholder = {
  number: (value: number | null | undefined): number => (value == null ? schemaPlaceholderValues.number : value),

  percentNumber: (value: number | null | undefined): number => {
    if (value == null) return schemaPlaceholderValues.number;
    return value < 1 ? value * 100 : value;
  },

  string: (value: string | null | undefined): string => (value == null ? schemaPlaceholderValues.string : value),

  optional: <T>(value: T): T | undefined => (value == null || value === '' ? undefined : value),

  isoDate: (value: Date | string | null | undefined): string | undefined =>
    value == null ? undefined : timeAndDate(value).toISOString(),
};

const transformPrimitive = {
  toNumber: (value: unknown): number | undefined => {
    const v = Number(value);
    if (Number.isFinite(v)) return v;
    return undefined;
  },
};

const transformDate = {
  dateToEndDay: (value: Date | string | null | undefined): Date | undefined => {
    if (value == null) return undefined;
    return timeAndDate(value).endOf('day').toDate();
  },

  dateToStartDay: (value: Date | string | null | undefined): Date | undefined => {
    if (value == null) return undefined;
    return timeAndDate(value).startOf('day').toDate();
  },

  dateToISOSFormat: (value: Date | string | null | undefined): string | undefined =>
    value == null ? undefined : timeAndDate(value).toISOString(),
};

export { transformToPlaceholder, schemaPlaceholderValues, transformPrimitive, transformDate, formElementsValues };
