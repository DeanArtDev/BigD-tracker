import { Injectable } from '@nestjs/common';
import { BulkInsertFailedError } from '@shared/lib/errors';
import { DB, KyselyService } from '@shared/modules/db';
import { ExpressionBuilder } from 'kysely';
import {
  RepetitionFinishType,
  RepetitionRawData,
  RepetitionsRepository,
} from '../application/repetitions.repository';
import { RepetitionEntity } from '../domain/repetition.entity';

/*
* Вот сводная табличка по слоям DDD и их содержимому с учётом типичной структуры NestJS:

Слой	Что содержит	Пример папок и файлов в NestJS
Domain	— Агрегаты и сущности (Entity) Value Objects
— Доменные сервисы (Domain Services)
— Репозиторные интерфейсы	src/trainings/domain/
– training.entity.ts
– exercise.entity.ts
– training.repository.ts
– order.domain-service.ts

Application	— Application Services (координация шагов)
— DTO для операций (in/out)
— Мапперы (Entity ↔ DTO)
— Контроллеры (API)	src/trainings/application/
– dto/ (create-training.dto.ts, update-training.dto.ts)
– training.service.ts
– training.controller.ts
– training.mapper.ts

Infrastructure	— Реализации репозиториев (TypeORM/Kysely)
— Конфигурация БД и модулей TypeOrmModule/KyselyModule
— Интеграции с внешними сервисами (кэш, очередь)	src/trainings/infra/
– kysely-training.repository.ts
– typeorm-training.repository.ts
– training.orm-entity.ts

Presentation	— Swagger/OpenAPI-декорации (@ApiProperty)
— Guard’ы, Interceptor’ы, Pipe’ы
— Модульные вьюхи (GraphQL резолверы или WebSockets)	src/trainings/application/ (контроллеры)
src/common/ (Guards, Pipes, Interceptors)

Shared/Commons	— Общие DTO и интерфейсы
— Утилитарные функции и классы
— Базовые модули (LoggerModule, ConfigModule)	src/common/, src/shared/

Domain: бизнес-правила и инварианты — код, не зависящий от NestJS.
Application: orchestration и валидация входящих/исходящих данных через DTO и Pipes.
Infrastructure: всё, что привязывает домен к конкретным технологиям.
Presentation: публичный API, безопасность, документация.
Shared: переиспользуемые вещи между модулями.
*/
/*
* Feature-based папки (domain/, infra/, application/).
🎯 Domain: Training и вложенная Exercise с методами и инвариантами.
🛰️ Infra: KyselyTrainingRepository с mapRowToEntity.
🚀 Application: DTO, Mapper, Service (create/update), Controller.
🔌 Module: провайдер репозитория, сервис и контроллер.
*
* */
// 📁 src/
// ├── shared/                  # общие ValueObjects, utils, types
// │   └── value-objects/
// │       └── UUID.ts
// ├── trainings/               # модуль Training-агрегации
// │   ├── domain/
// │   │   ├── training.entity.ts
// │   │   ├── exercise.entity.ts  # вложенная сущность внутри агрегата
// │   │   └── training.repository.ts  # interface
// │   ├── infra/
// │   │   └── kysely-training.repository.ts  # Kysely implementation
// │   ├── application/
// |   │   ├── use-cases/               # Каждый use-case как отдельный сервис
// |   │   │   ├── create-training.service.ts
// |   │   │   ├── update-training.service.ts
// |   │   │   ├── get-training.service.ts
// |   │   │   └── delete-training.service.ts
// │   │   ├── dto/
// │   │   │   ├── create-training.dto.ts
// │   │   │   ├── update-training.dto.ts
// │   │   │   └── training.dto.ts
// │   │   ├── training.mapper.ts
// |   │   ├── training.query.service.ts   # Query use-cases, если нужны
// │   │   └── training.controller.ts
// │   └── trainings.module.ts
// ├── exercises/              # самостоятельный модуль Exercise
// │   ├── domain/
// │   │   ├── exercise.entity.ts
// │   │   └── exercise.repository.ts
// │   ├── infra/
// │   │   └── kysely-exercise.repository.ts
// │   ├── application/
// │   │   ├── dto/
// │   │   │   ├── create-exercise.dto.ts
// │   │   │   └── update-exercise.dto.ts
// │   │   ├── exercise.service.ts
// │   │   └── exercise.controller.ts
// │   └── exercises.module.ts
// └── app.module.ts

@Injectable()
export class KyselyRepetitionsRepository implements RepetitionsRepository {
  constructor(private readonly kyselyService: KyselyService) {}

  async createMany(data: RepetitionRawData['insertable'][]): Promise<RepetitionEntity[]> {
    try {
      const result = await this.kyselyService.db.transaction().execute(async (transaction) => {
        return await transaction.insertInto('repetitions').values(data).returningAll().execute();
      });
      return result.map(this.#map);
    } catch {
      throw new BulkInsertFailedError('Bulk insert of repetitions is failed');
    }
  }

  async update(data: RepetitionRawData['updateable']): Promise<RepetitionEntity | null> {
    const result = await this.kyselyService.db
      .updateTable('repetitions')
      .set(data)
      .returningAll()
      .executeTakeFirst();
    if (result == null) return null;

    return this.#map(result);
  }

  async findOneById(id: number): Promise<RepetitionEntity | null> {
    const result = await this.kyselyService.db
      .selectFrom('repetitions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (result == null) return null;

    return this.#map(result);
  }

  async findAllByFilters(filters: {
    exerciseId: number;
    userId?: number | null;
  }): Promise<RepetitionEntity[]> {
    let query = this.kyselyService.db.selectFrom('repetitions').selectAll();

    query = query.where((eb) => {
      const { userId, exerciseId } = filters;

      const conditions: ReturnType<ExpressionBuilder<DB, 'repetitions'>>[] = [];

      if (exerciseId != null) {
        conditions.push(eb('exercises_id', '=', exerciseId));
      }

      if (userId != null) {
        conditions.push(eb('user_id', '=', userId));
      } else if (userId === null) {
        conditions.push(eb('user_id', 'is', null));
      }

      return eb.and(conditions);
    });

    const result = await query.execute();
    return result.map(this.#map);
  }

  async findTemplatables(): Promise<RepetitionEntity[]> {
    const result = await this.kyselyService.db
      .selectFrom('repetitions')
      .where('user_id', 'is', null)
      .selectAll()
      .execute();

    return result.map(this.#map);
  }

  async deleteMany(ids: number[]): Promise<boolean> {
    if (ids.length === 0) return false;
    try {
      await this.kyselyService.db.transaction().execute(async (transaction) => {
        return await transaction.deleteFrom('repetitions').where('id', 'in', ids).execute();
      });
      return true;
    } catch {
      throw new BulkInsertFailedError('Bulk delete of repetitions is failed');
    }
  }

  async deleteByExerciseIds(ids: number[]): Promise<number> {
    const result = await this.kyselyService.db
      .deleteFrom('repetitions')
      .where('exercises_id', 'in', ids)
      .executeTakeFirst();
    console.log('deleteByExerciseIds', result);
    return Number(result.numDeletedRows ?? 0);
  }

  #map = (raw: RepetitionRawData['selectable']): RepetitionEntity => {
    return RepetitionEntity.restore({
      id: raw.id,
      exerciseId: raw.exercises_id,
      factBreak: raw.fact_break ?? undefined,
      factWeight: raw.fact_weight ?? undefined,
      userId: raw.user_id ?? undefined,
      factCount: raw.fact_count ?? undefined,
      targetWeight: raw.target_weight,
      finishType: (raw.finish_type as RepetitionFinishType) ?? undefined,
      targetBreak: raw.target_break,
      targetCount: raw.target_count,
      description: raw.description ?? undefined,
    });
  };
}
