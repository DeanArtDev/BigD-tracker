import { Module } from '@nestjs/common';
import { RepetitionsMapper } from './application/repetitions.mapper';
import { REPETITIONS_REPOSITORY } from './application/repetitions.repository';
import { CreateRepetitionsUseCase, DeleteRepetitionsUseCase, FinishRepetitionsUseCase } from './application/use-cases';
import { KyselyRepetitionsRepository } from './infra/kysely-repetitions.repository';

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
