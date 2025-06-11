import { FinishRepetitionsService } from '@/repetitions/application/use-cases/finish-repetitions.service/finish-repetitions.service';
import { UpdateRepetitionsService } from './application/use-cases/update-repetitions.service';
import { DeleteRepetitionsService } from './application/use-cases/delete-repetitions.service';
import { CreateRepetitionsService } from './application/use-cases/create-repetitions.service';
import { REPETITIONS_REPOSITORY } from './application/repetitions.repository';
import { Module } from '@nestjs/common';
import { RepetitionsMapper } from './application/repetitions.mapper';
import { KyselyRepetitionsRepository } from './infra/kysely-repetitions.repository';

@Module({
  exports: [
    REPETITIONS_REPOSITORY,
    RepetitionsMapper,
    DeleteRepetitionsService,
    CreateRepetitionsService,
    CreateRepetitionsService,
    UpdateRepetitionsService,
    FinishRepetitionsService,
  ],
  providers: [
    { provide: REPETITIONS_REPOSITORY, useClass: KyselyRepetitionsRepository },
    RepetitionsMapper,
    DeleteRepetitionsService,
    CreateRepetitionsService,
    CreateRepetitionsService,
    UpdateRepetitionsService,
    FinishRepetitionsService,
  ],
})
export class RepetitionsModule {}
