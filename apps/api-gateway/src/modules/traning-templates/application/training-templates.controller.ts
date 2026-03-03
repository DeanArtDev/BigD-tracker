import { AppRmqClient, TRAINING_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import {
  TrainingCreateTemplate,
  TrainingDeleteTemplate,
  TrainingGetOneTemplate,
  TrainingGetTrainingTemplates,
  TrainingUpdateTemplate,
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import { GetTrainingTemplatesDto, TrainingTemplateResponse, TrainingTemplateWithExercisesResponseSingle } from './dtos';
import { CreateTrainingTemplateWithExercisesRequest, UpdateTrainingTemplateWithExerciseRequest } from './use-cases';

@ApiTags('Training templates')
@Controller('trainings-templates')
export class TrainingTemplatesController {
  constructor(@Inject(TRAINING_RMQ_SERVICE) private readonly trainingClient: AppRmqClient) {}

  @Get()
  @ApiOperation({
    summary: 'Получение шаблонов тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingTemplateResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(TrainingTemplateResponse)
  async getTrainingTemplates(
    @Query() { my = false }: GetTrainingTemplatesDto,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingTemplateResponse> {
    return await this.trainingClient.send<TrainingGetTrainingTemplates.Response, TrainingGetTrainingTemplates.Request>(
      TrainingGetTrainingTemplates.pattern,
      { data: { my, userId: uid } },
    );
  }

  @Get('/:templateId')
  @ApiOperation({
    summary: 'Получение одного шаблона тренировки с упражнениями',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingTemplateWithExercisesResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(TrainingTemplateWithExercisesResponseSingle)
  async getOneTrainingsWithExercises(
    @Param('templateId', ParseIntPipe) templateId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingTemplateWithExercisesResponseSingle> {
    return await this.trainingClient.send<TrainingGetOneTemplate.Response, TrainingGetOneTemplate.Request>(
      TrainingGetOneTemplate.pattern,
      { data: { id: templateId, userId: uid } },
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Создание шаблона тренировки',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TrainingTemplateWithExercisesResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(TrainingTemplateWithExercisesResponseSingle)
  async createTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTrainingTemplateWithExercisesRequest,
  ): Promise<TrainingTemplateWithExercisesResponseSingle> {
    return await this.trainingClient.send<TrainingCreateTemplate.Response, TrainingCreateTemplate.Request>(
      TrainingCreateTemplate.pattern,
      { data: { ...data, userId: uid } },
    );
  }

  @Put('/:templateId')
  @ApiOperation({
    summary: 'Обновление шаблона тренировки с упражнениями',
    description: 'nullable поля очищают значения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingTemplateWithExercisesResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(TrainingTemplateWithExercisesResponseSingle)
  async putTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() { data }: UpdateTrainingTemplateWithExerciseRequest,
  ): Promise<TrainingTemplateWithExercisesResponseSingle> {
    return await this.trainingClient.send<TrainingUpdateTemplate.Response, TrainingUpdateTemplate.Request>(
      TrainingUpdateTemplate.pattern,
      {
        data: {
          id: templateId,
          userId: uid,
          type: data.type,
          name: data.name,
          description: data.description,
          postTrainingDuration: data.postTrainingDuration,
          wormUpDuration: data.wormUpDuration,
          exercises: data.exercises,
        },
      },
    );
  }

  @Delete(':templateId')
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
    @Param('templateId', ParseIntPipe) templateId: number,
  ): Promise<void> {
    await this.trainingClient.send<TrainingDeleteTemplate.Response, TrainingDeleteTemplate.Request>(
      TrainingDeleteTemplate.pattern,
      { data: { id: templateId, userId: uid } },
    );
    return;
  }
}
