import { afterAll } from 'vitest';

const TEST_DATE = '2023-01-01T00:00:00.000Z';

function mockDate(dateToUse: string = TEST_DATE): void {
  const globalWithDate = globalThis as typeof globalThis & {
    Date: DateConstructor;
  };
  const RealDate = globalWithDate.Date;
  const fixedDate = dateToUse;

  class MockedDate extends RealDate {
    constructor(value?: Date | string | number) {
      super(value ?? fixedDate);
    }
  }

  MockedDate.now = () => new RealDate(fixedDate).getTime();
  MockedDate.UTC = RealDate.UTC;
  MockedDate.parse = RealDate.parse;

  globalWithDate.Date = MockedDate as unknown as DateConstructor;

  afterAll(() => {
    globalWithDate.Date = RealDate;
  });
}

export { TEST_DATE, mockDate };
