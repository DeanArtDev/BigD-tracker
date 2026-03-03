import { AppRmqClient, TRAINING_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import {
  TrainingCreateExercise,
  TrainingDeleteExercise,
  TrainingGetExerciseTemplates,
  TrainingGetOneExercise,
  TrainingUpdateExercise,
} from '@big-d/api-contracts';
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
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import {
  ExerciseWithRepetitionsResponse,
  ExerciseWithRepetitionsResponseSingle,
} from './dtos/exercise-with-repetitions-response.dto';
import { GetExerciseQuery } from './dtos/get-exercise.dto';
import { CreateExerciseWithRepetitionsRequest, UpdateExerciseWithRepetitionsRequest } from './use-cases';

@Controller('exercises')
export class ExercisesController {
  constructor(@Inject(TRAINING_RMQ_SERVICE) private readonly trainingClient: AppRmqClient) {}

  @Get('/templates')
  @ApiOperation({
    summary: 'Получение шаблонов упражнений',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ExerciseWithRepetitionsResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(ExerciseWithRepetitionsResponse)
  async getExercises(
    @Query() { my = false }: GetExerciseQuery,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<ExerciseWithRepetitionsResponse> {
    return await this.trainingClient.send<TrainingGetExerciseTemplates.Response, TrainingGetExerciseTemplates.Request>(
      TrainingGetExerciseTemplates.pattern,
      { data: { my, userId: uid } },
    );
  }

  @Get('/:exerciseId/repetitions')
  @ApiOperation({
    summary: 'Получение одного упражнения с повторениями',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ExerciseWithRepetitionsResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(ExerciseWithRepetitionsResponse)
  async getOneExerciseWithRepetitions(
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<ExerciseWithRepetitionsResponseSingle> {
    return await this.trainingClient.send<TrainingGetOneExercise.Response, TrainingGetOneExercise.Request>(
      TrainingGetOneExercise.pattern,
      { data: { id: exerciseId, userId: uid } },
    );
  }

  @Post('/repetitions')
  @ApiOperation({
    summary: 'Создание упражнения c повторениями',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ExerciseWithRepetitionsResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(ExerciseWithRepetitionsResponseSingle)
  async createExerciseWithRepetitions(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateExerciseWithRepetitionsRequest,
  ): Promise<ExerciseWithRepetitionsResponseSingle> {
    return await this.trainingClient.send<TrainingCreateExercise.Response, TrainingCreateExercise.Request>(
      TrainingCreateExercise.pattern,
      { data: { ...data, userId: uid } },
    );
  }

  @Put('/:exerciseId/repetitions')
  @ApiOperation({
    summary: 'Обновление упражнения с повторениями',
    description: 'nullable поля очищают значения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ExerciseWithRepetitionsResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(ExerciseWithRepetitionsResponseSingle)
  async updateExerciseWithRepetitions(
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: UpdateExerciseWithRepetitionsRequest,
  ): Promise<ExerciseWithRepetitionsResponseSingle> {
    return await this.trainingClient.send<TrainingUpdateExercise.Response, TrainingUpdateExercise.Request>(
      TrainingUpdateExercise.pattern,
      {
        data: {
          id: exerciseId,
          userId: uid,
          type: data.type,
          repetitions: data.repetitions,
          name: data.name,
          description: data.description,
          exampleUrl: data.exampleUrl,
        },
      },
    );
  }

  @Delete('/:exerciseId')
  @ApiOperation({
    summary: 'Удаление упражнения',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExerciseTemplate(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ): Promise<void> {
    await this.trainingClient.send<TrainingDeleteExercise.Response, TrainingDeleteExercise.Request>(
      TrainingDeleteExercise.pattern,
      { data: { id: exerciseId, userId: uid } },
    );
    return;
  }
}
