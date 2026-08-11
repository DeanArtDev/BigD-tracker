import path from 'node:path';
import '@testing-library/jest-dom/vitest';
import dotenv from 'dotenv';

dotenv.config({
  path: [path.join(process.cwd(), '.env.production')],
});
