import { Module } from '@nestjs/common';
import { TrainingsMapper } from './trainings.mapper';
import { TrainingsService } from './trainings.service';
import { TrainingsRepository } from './trainings.repository';
import { TrainingsTemplatesRepository } from './trainings-templates.repository';
import { TrainingsTemplatesMapper } from './trainings-template.mapper';

@Module({
  exports: [
    TrainingsService,
    TrainingsRepository,
    TrainingsMapper,
    TrainingsTemplatesMapper,
    TrainingsTemplatesRepository,
  ],
  providers: [
    TrainingsService,
    TrainingsRepository,
    TrainingsTemplatesRepository,
    TrainingsMapper,
    TrainingsTemplatesMapper,
  ],
})
export class TrainingsModule {}
