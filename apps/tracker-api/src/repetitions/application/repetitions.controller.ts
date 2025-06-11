import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import { FinishRepetitionsRequest } from './use-cases/finish-repetitions.service/finish-repetitions.dto';
import { FinishRepetitionsService } from './use-cases/finish-repetitions.service/finish-repetitions.service';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RepetitionsResponse } from './dto/repetition-response.dto';

@Controller('repetitions')
export class RepetitionsController {
  constructor(private readonly finishRepetitionsService: FinishRepetitionsService) {}

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
    return {
      data: await this.finishRepetitionsService.execute({
        exerciseId: data.exerciseId,
        repetitions: data.repetitions,
        userId: uid,
      }),
    };
  }
}
