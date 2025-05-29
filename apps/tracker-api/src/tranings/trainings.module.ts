import { Module } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { TrainingsController } from './trainings.controller';
import { TrainingsRepository } from './trainings.repository';
import { TrainingsTemplatesRepository } from './trainings-templates.repository';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [UsersModule],
  exports: [TrainingsService],
  controllers: [TrainingsController],
  providers: [TrainingsService, TrainingsRepository, TrainingsTemplatesRepository],
})
export class TrainingsModule {}
