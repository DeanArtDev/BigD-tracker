import { Kysely } from 'kysely';
import { DB } from '../db-types';
import { getDb } from './get-db';

async function runSeeds(
  seeds: { key: string; target: string; seed: (db: Kysely<DB>) => Promise<void> }[],
  scriptKey?: string,
) {
  const db = getDb();

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

async function runSeed(script: any, db: Kysely<DB>) {
  const { target, seed } = script;

  try {
    console.info(`⏳ Запуск сид-скрипта ${target}...`);
    await seed(db);
  } catch (error) {
    console.error(`❌ Произошла ошибка в сид-скрипте ${target}`, error);
    process.exit(1);
  }
}

export { runSeeds };
