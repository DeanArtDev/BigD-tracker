import { TrainingServiceClientModule } from '@/infrastructure/rmq-clients';
import { Module } from '@nestjs/common';
import { TrainingTemplatesController } from './application/training-templates.controller';

@Module({
  imports: [TrainingServiceClientModule],
  controllers: [TrainingTemplatesController],
})
export class TrainingTemplatesModule {}
