import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/modules/auth/lib';
import { RepetitionsMapper } from '@/modules/repetitions';
import { FinishRepetitionsRequest } from './use-cases/finish-repetitions.service/finish-repetitions.dto';
import { FinishRepetitionsService } from './use-cases/finish-repetitions.service/finish-repetitions.service';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RepetitionsResponse } from './dto/repetition-response.dto';

@Controller('repetitions')
export class RepetitionsController {
  constructor(
    private readonly finishRepetitionsService: FinishRepetitionsService,
    private readonly repetitionsMapper: RepetitionsMapper,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Завершение повторение',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RepetitionsResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createExerciseWithRepetitions(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: FinishRepetitionsRequest,
  ): Promise<RepetitionsResponse> {
    const entities = await this.finishRepetitionsService.execute({
      exerciseId: data.exerciseId,
      repetitions: data.repetitions,
      userId: uid,
    });

    return {
      data: entities.map(this.repetitionsMapper.fromEntityToDTO),
    };
  }
}
