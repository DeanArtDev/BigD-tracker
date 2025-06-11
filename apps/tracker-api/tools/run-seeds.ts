import { Kysely } from 'kysely';
import seeds from '../db/seeds';
import { DB } from '../src/shared/modules/db';
import { getDb } from './get-db';

export async function runSeeds() {
  const db = getDb();

  const scriptKey = process.argv[2];

  if (scriptKey) {
    const script = seeds.find(({ key }) => key === scriptKey);

    if (!script) {
      console.error(
        'Cид-скрипт по указанному ключу не найден.',
        JSON.stringify(
          {
            givenKey: scriptKey,
            availableKeys: seeds.map(({ key }) => key),
          },
          null,
          2,
        ),
      );
      process.exit(1);
    }

    await runSeed(script, db);

    console.info(`✅ Сид ${scriptKey} был успешно загружен!`);
  } else {
    let ranCount = 0;

    console.info('Начинаем загрузку сидов...');
    for (const { target, seed } of seeds) {
      console.info(`⏳ Запуск сид-скрипта ${target}...`);
      ranCount += 1;

      await seed(db);
    }

    if (ranCount === seeds.length) {
      console.info('✅ Все сиды были успешно загружены!');
    } else if (ranCount === 0) {
      console.info('🤨 Не было выбрано ни одного сида для загрузки.');
    } else {
      console.info(`✅ успешно загружено ${ranCount} сид(-а, -ов)!`);
    }
  }

  await db.destroy();
}

async function runSeed(script: (typeof seeds)[number], db: Kysely<DB>) {
  const { target, seed } = script;

  try {
    console.info(`⏳ Запуск сид-скрипта ${target}...`);
    await seed(db);
  } catch (error) {
    console.error(`❌ Произошла ошибка в сид-скрипте ${target}`, error);
    process.exit(1);
  }
}

runSeeds();
