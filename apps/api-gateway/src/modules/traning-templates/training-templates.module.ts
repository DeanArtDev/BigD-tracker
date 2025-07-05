import { Module } from '@nestjs/common';
import { TrainingTemplatesController } from './application/training-templates.controller';

@Module({
  controllers: [TrainingTemplatesController],
})
export class TrainingTemplatesModule {}
