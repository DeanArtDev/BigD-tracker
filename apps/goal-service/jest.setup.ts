import * as dotenv from 'dotenv';
import { join } from 'node:path';
import process from 'node:process';

dotenv.config({
  path: [join(process.cwd(), '.env.development')],
});

function initTestEnvironment() {
  jest.setTimeout(4000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllTimers();
  });
}

export { initTestEnvironment };
