import { FinishRepetitionsUseCase } from './application/use-cases/finish-repetitions.use-case';
import { DeleteRepetitionsUseCase } from './application/use-cases/delete-repetitions.use-case';
import { CreateRepetitionsUseCase } from './application/use-cases/create-repetitions.use-case';
import { REPETITIONS_REPOSITORY } from './application/repetitions.repository';
import { Module } from '@nestjs/common';
import { RepetitionsMapper } from './application/repetitions.mapper';
import { KyselyRepetitionsRepository } from './infra/kysely-repetitions.repository';

/* TODO:
 *   [] вынести в api-contracts DTOs
 *   []
 *   []
 *   []
 *   []
 *   []
 * */
@Module({
  exports: [
    REPETITIONS_REPOSITORY,
    RepetitionsMapper,
    DeleteRepetitionsUseCase,
    CreateRepetitionsUseCase,
    CreateRepetitionsUseCase,
    FinishRepetitionsUseCase,
  ],
  providers: [
    { provide: REPETITIONS_REPOSITORY, useClass: KyselyRepetitionsRepository },
    RepetitionsMapper,
    DeleteRepetitionsUseCase,
    CreateRepetitionsUseCase,
    CreateRepetitionsUseCase,
    FinishRepetitionsUseCase,
  ],
})
export class RepetitionsModule {}
