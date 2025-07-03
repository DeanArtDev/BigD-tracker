import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrainingTemplatesService } from '../domain/training-templates.service';
import {
  GetTrainingTemplatesDto,
  TrainingTemplateResponse,
  TrainingTemplateWithExercisesResponseSingle,
} from './dtos';
import {
  CreateTrainingTemplateCommand,
  CreateTrainingTemplateWithExercisesRequest,
  UpdateTrainingTemplateWithExerciseRequest,
} from './use-cases';

@ApiTags('Training templates')
@Controller('trainings-templates')
export class TrainingTemplatesController {
  constructor(
    private readonly trainingTemplatesService: TrainingTemplatesService,
    private readonly createTrainingTemplateCommand: CreateTrainingTemplateCommand,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Получение шаблонов тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingTemplateResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getTrainings(
    @Query() { my = false }: GetTrainingTemplatesDto,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingTemplateResponse> {
    return {
      data: await this.trainingTemplatesService.all({ userId: uid, my }),
    };
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
  async getOneTrainingsWithExercises(
    @Param('templateId', ParseIntPipe) templateId: number,
  ): Promise<TrainingTemplateWithExercisesResponseSingle> {
    return {
      data: await this.trainingTemplatesService.oneWithExercises({ id: templateId }),
    };
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
  async createTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTrainingTemplateWithExercisesRequest,
  ): Promise<TrainingTemplateWithExercisesResponseSingle> {
    return {
      data: await this.trainingTemplatesService.createOneWithExercises({ ...data, userId: uid }),
    };
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
  async putTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() { data }: UpdateTrainingTemplateWithExerciseRequest,
  ): Promise<TrainingTemplateWithExercisesResponseSingle> {
    return {
      data: await this.trainingTemplatesService.updateOneWithExercises({
        id: templateId,
        userId: uid,
        ...data,
      }),
    };
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
    await this.createTrainingTemplateCommand.execute({ id: templateId, userId: uid });
    return;
  }
}
