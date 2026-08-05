import { omitUndefined } from './omit-undefined';

describe('omitUndefined', () => {
  test('removes only undefined values', () => {
    expect(omitUndefined({ present: 'value', nullable: null, missing: undefined })).toEqual({
      present: 'value',
      nullable: null,
    });
  });
});
