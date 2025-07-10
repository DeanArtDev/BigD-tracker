import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import {
  TRAINING_SERVICE_RMQ_KEY,
  TrainingAssignTrainings,
  TrainingCreateTraining,
  TrainingCreateTrainingByTemplate,
  TrainingDeleteTraining,
  TrainingFinishTraining,
  TrainingGetActiveTraining,
  TrainingGetOneTraining,
  TrainingGetTrainings,
  TrainingSetBreakFact,
  TrainingSetFact,
  TrainingStartTraining,
  TrainingUpdateTraining,
} from '@big-d/api-contracts';
import { ValidateRpcResponse } from '@big-d/api-utils';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { GetTrainingsQuery } from './dtos/get-trainings.dto';
import { TrainingResponse } from './dtos/training-response.dto';
import {
  TrainingWithExercisesResponse,
  TrainingWithExercisesResponseSingle,
} from './dtos/tranings-with-exercises-response.dto';
import {
  AssignTrainingRequest,
  CreateTrainingByTemplateRequest,
  CreateTrainingWithExercisesRequest,
  UpdateTrainingWithExerciseRequest,
} from './use-cases';
import { SetRepetitionBreakRequest, SetRepetitionFactRequest } from './use-cases';

@ApiTags('Trainings')
@Controller('trainings')
export class TrainingsController {
  constructor(@Inject(TRAINING_SERVICE_RMQ_KEY) private readonly trainingClient: ClientProxy) {}

  @Get('/active')
  @ApiOperation({
    summary: 'Получение активной тренировки на текущий день',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingWithExercisesResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(TrainingWithExercisesResponseSingle)
  async getActiveTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingWithExercisesResponseSingle> {
    return await firstValueFrom(
      this.trainingClient.send<
        TrainingGetActiveTraining.Response,
        TrainingGetActiveTraining.Request
      >(TrainingGetActiveTraining.pattern, { data: { userId: uid } }),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Получение тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(TrainingResponse)
  async getTrainings(
    @Query() { from, to }: GetTrainingsQuery,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingResponse> {
    return await firstValueFrom(
      this.trainingClient.send<TrainingGetTrainings.Response, TrainingGetTrainings.Request>(
        TrainingGetTrainings.pattern,
        { data: { userId: uid, from, to } },
      ),
    );
  }

  @Get('/:trainingId')
  @ApiOperation({
    summary: 'Получение одной тренировки с упражнениями',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingWithExercisesResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(TrainingWithExercisesResponseSingle)
  async getOneTrainingsWithExercises(
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingWithExercisesResponseSingle> {
    return await firstValueFrom(
      this.trainingClient.send<TrainingGetOneTraining.Response, TrainingGetOneTraining.Request>(
        TrainingGetOneTraining.pattern,
        { data: { userId: uid, id: trainingId } },
      ),
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Создание тренировки',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TrainingWithExercisesResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.CREATED)
  @ValidateRpcResponse(TrainingWithExercisesResponseSingle)
  async createTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTrainingWithExercisesRequest,
  ): Promise<TrainingWithExercisesResponseSingle> {
    return await firstValueFrom(
      this.trainingClient.send<TrainingCreateTraining.Response, TrainingCreateTraining.Request>(
        TrainingCreateTraining.pattern,
        { data: { userId: uid, ...data } },
      ),
    );
  }

  @Post('/templates')
  @ApiOperation({
    summary: 'Создание тренировки по шаблону',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TrainingWithExercisesResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.CREATED)
  @ValidateRpcResponse(TrainingWithExercisesResponse)
  async createTrainingByTemplate(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTrainingByTemplateRequest,
  ): Promise<TrainingWithExercisesResponse> {
    return await firstValueFrom(
      this.trainingClient.send<
        TrainingCreateTrainingByTemplate.Response,
        TrainingCreateTrainingByTemplate.Request
      >(TrainingCreateTrainingByTemplate.pattern, { data: { userId: uid, items: data } }),
    );
  }

  @Put('/:trainingId')
  @ApiOperation({
    summary: 'Обновление тренировки с упражнениями',
    description: 'nullable поля очищают значения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Тренировка обновлена',
    type: TrainingWithExercisesResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(TrainingWithExercisesResponseSingle)
  async putTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @Body() { data }: UpdateTrainingWithExerciseRequest,
  ): Promise<TrainingWithExercisesResponseSingle> {
    return await firstValueFrom(
      this.trainingClient.send<TrainingUpdateTraining.Response, TrainingUpdateTraining.Request>(
        TrainingUpdateTraining.pattern,
        { data: { id: trainingId, userId: uid, ...data } },
      ),
    );
  }

  @Post('/assign')
  @ApiOperation({
    summary: 'Назначение тренировки на дату',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignTrainings(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: AssignTrainingRequest,
  ): Promise<void> {
    await firstValueFrom(
      this.trainingClient.send<TrainingAssignTrainings.Response, TrainingAssignTrainings.Request>(
        TrainingAssignTrainings.pattern,
        { data: { items: data, userId: uid } },
      ),
    );
    return;
  }

  @Post('/:trainingId/start')
  @ApiOperation({
    summary: 'Начать тренировку',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async stratTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('trainingId', ParseIntPipe) trainingId: number,
  ): Promise<void> {
    await firstValueFrom(
      this.trainingClient.send<TrainingStartTraining.Response, TrainingStartTraining.Request>(
        TrainingStartTraining.pattern,
        { data: { userId: uid, id: trainingId } },
      ),
    );
    return;
  }

  @Post('/:trainingId/finish')
  @ApiOperation({
    summary: 'Завершить тренировку',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async finishTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('trainingId', ParseIntPipe) trainingId: number,
  ): Promise<void> {
    await firstValueFrom(
      this.trainingClient.send<TrainingFinishTraining.Response, TrainingFinishTraining.Request>(
        TrainingFinishTraining.pattern,
        { data: { userId: uid, id: trainingId } },
      ),
    );
    return;
  }

  @Post('/:trainingId/repetition/:repetitionId/fact')
  @ApiOperation({
    summary: 'Установить факт',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setFact(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('repetitionId', ParseIntPipe) repetitionId: number,
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @Body() { data }: SetRepetitionFactRequest,
  ): Promise<void> {
    await firstValueFrom(
      this.trainingClient.send<TrainingSetFact.Response, TrainingSetFact.Request>(
        TrainingSetFact.pattern,
        {
          data: {
            userId: uid,
            trainingId,
            repetitionId,
            factCount: data.factCount,
            factWeight: data.factWeight,
            finishType: data.finishType,
          },
        },
      ),
    );
    return;
  }

  @Post('/:trainingId/repetition/:repetitionId/break')
  @ApiOperation({
    summary: 'Установить факт отдыха в повторении',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setBrakFact(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('repetitionId', ParseIntPipe) repetitionId: number,
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @Body() { data }: SetRepetitionBreakRequest,
  ): Promise<void> {
    await firstValueFrom(
      this.trainingClient.send<TrainingSetBreakFact.Response, TrainingSetBreakFact.Request>(
        TrainingSetBreakFact.pattern,
        {
          data: {
            userId: uid,
            trainingId,
            repetitionId,
            factBreak: data.factBreak,
          },
        },
      ),
    );
    return;
  }

  @Delete(':trainingId')
  @ApiOperation({
    summary: 'Удаление тренировки',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Тренировка удалена',
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('trainingId', ParseIntPipe) trainingId: number,
  ): Promise<void> {
    await firstValueFrom(
      this.trainingClient.send<TrainingDeleteTraining.Response, TrainingDeleteTraining.Request>(
        TrainingDeleteTraining.pattern,
        { data: { userId: uid, id: trainingId } },
      ),
    );
    return;
  }
}
