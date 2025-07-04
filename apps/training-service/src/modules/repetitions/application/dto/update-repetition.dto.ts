import { Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

class UpdateRepetitionDto {
  @IsInt()
  @Expose()
  id: number;

  @IsInt()
  @Expose()
  exerciseId: number;

  @IsInt()
  @Expose()
  targetCount: number;

  @IsString()
  @Expose()
  targetWeight: string;

  @IsInt()
  @Expose()
  targetBreak: number;
}

export { UpdateRepetitionDto };
