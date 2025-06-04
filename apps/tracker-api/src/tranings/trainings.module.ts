import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { TrainingsMapper } from './trainings.mapper';
import { TrainingsService } from './trainings.service';
import { TrainingsController } from './trainings.controller';
import { TrainingsRepository } from './trainings.repository';
import { TrainingsTemplatesRepository } from './trainings-templates.repository';
import { TrainingsTemplatesMapper } from './trainings-template.mapper';

@Module({
  imports: [UsersModule],
  exports: [
    TrainingsService,
    TrainingsRepository,
    TrainingsMapper,
    TrainingsTemplatesMapper,
    TrainingsTemplatesRepository,
  ],
  controllers: [TrainingsController],
  providers: [
    TrainingsService,
    TrainingsRepository,
    TrainingsTemplatesRepository,
    TrainingsMapper,
    TrainingsTemplatesMapper,
  ],
})
export class TrainingsModule {}
