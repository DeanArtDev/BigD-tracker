import { Kysely } from 'kysely';
import { DB } from '../../src/shared/modules/db/types';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { join } from 'node:path';
import * as process from 'node:process';

dotenv.config({
  path: [join(process.cwd(), '.env.test-user')],
});

export const testUserConfig = {
  TEST_USER_LOGIN: process.env.TEST_USER_LOGIN ?? '',
  TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD ?? '',
};

export default {
  key: 'test-user',
  target: 'Тестовый пользователь',
  seed: async (db: Kysely<DB>) => {
    if (!testUserConfig.TEST_USER_LOGIN || !testUserConfig.TEST_USER_PASSWORD) {
      console.log(`🚫 логин или пароль для тестового пользователя не установлен`);
      process.exit(1);
    }

    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('users').execute();

      const result = await trx
        .insertInto('users')
        .values({
          password_hash: bcrypt.hashSync(testUserConfig.TEST_USER_PASSWORD, 10),
          email: testUserConfig.TEST_USER_LOGIN,
        })
        .returningAll()
        .executeTakeFirst();

      if (result != null) {
        console.log(`✅Тестовый пользак ${testUserConfig.TEST_USER_LOGIN} залит успешно`);
      }
    });
  },
};
