import * as dotenv from 'dotenv';
import { join } from 'node:path';
import process from 'node:process';

dotenv.config({
  path: [join(process.cwd(), '.env.development')],
});
