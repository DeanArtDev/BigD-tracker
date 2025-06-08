import { RepetitionMapper } from '@/repetitions/repetitions.mapper';
import { RepetitionsRepository } from '@/repetitions/repetitions.repository';
import { Module } from '@nestjs/common';

@Module({
  exports: [RepetitionMapper, RepetitionsRepository],
  providers: [RepetitionMapper, RepetitionsRepository],
})
export class RepetitionsModule {}
