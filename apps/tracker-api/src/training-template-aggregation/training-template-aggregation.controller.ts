import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import { GetTrainingTemplatesAggregationFilters } from './dto/get-training-aggregation.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrainingTemplateAggregationResponse } from './dto/response-tarining-aggregation.dto';
import { TrainingTemplateAggregationMapper } from './training-template-aggregation.mapper';
import { TrainingTemplateAggregationService } from './training-template-aggregation.service';
import {
  CreateTrainingTemplateAggregationRequest,
  CreateTrainingTemplateAggregationUseCase,
} from './use-cases/create-training-aggregation';
import {
  UpdateTrainingTemplateAggregationRequest,
  UpdateTrainingTemplateAggregationUseCase,
} from './use-cases/update-training-aggregation';
import {
  AssignTrainingTemplateAggregationUseCase,
  AssignTrainingTemplateRequest,
} from './use-cases/assign-training-aggregation';

@ApiTags('Training templates')
@Controller('trainings/templates')
export class TrainingTemplateAggregationController {
  constructor(
    private readonly createTrainingTemplateAggregationUseCase: CreateTrainingTemplateAggregationUseCase,
    private readonly updateTrainingTemplateAggregationUseCase: UpdateTrainingTemplateAggregationUseCase,
    private readonly assignTrainingTemplateAggregationUseCase: AssignTrainingTemplateAggregationUseCase,
    private readonly trainingTemplateAggregationService: TrainingTemplateAggregationService,
    private readonly trainingTemplateAggregationMapper: TrainingTemplateAggregationMapper,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Получение шаблонов тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingTemplateAggregationResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getTrainingsTemplates(
    @Query() { my = false }: GetTrainingTemplatesAggregationFilters,
    @TokenPayload() { uid }: AccessTokenPayload,
  ) {
    const templates = await this.trainingTemplateAggregationService.getTrainings(uid, { my });

    return {
      data: templates.map(this.trainingTemplateAggregationMapper.fromEntityToDTO),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Создание шаблонов тренировок',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TrainingTemplateAggregationResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createTrainingTemplate(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTrainingTemplateAggregationRequest,
  ): Promise<TrainingTemplateAggregationResponse> {
    const templates = await this.createTrainingTemplateAggregationUseCase.execute(uid, data);

    return {
      data: templates.map(this.trainingTemplateAggregationMapper.fromEntityToDTO),
    };
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Назначение шаблона на дату',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async assignTrainingTemplate(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: AssignTrainingTemplateRequest,
  ) {
    await this.assignTrainingTemplateAggregationUseCase.execute(uid, data);
    return undefined;
  }

  @Put()
  @ApiOperation({
    summary: 'Полное обновление шаблонов тренировки',
    description: 'nullable поля очищают значения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingTemplateAggregationResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async putTrainingTemplate(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: UpdateTrainingTemplateAggregationRequest,
  ): Promise<TrainingTemplateAggregationResponse> {
    const templates = await this.updateTrainingTemplateAggregationUseCase.execute(uid, data);

    return {
      data: templates.map(this.trainingTemplateAggregationMapper.fromEntityToDTO),
    };
  }

  @Delete(':templateId')
  @ApiOperation({
    summary: 'Удаление шаблона тренировки',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Шаблон тренировки удален',
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async deleteTemplateTraining(
    @Param('templateId', ParseIntPipe) templateId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<void> {
    await this.trainingTemplateAggregationService.deleteTrainingTemplate({
      id: templateId,
      userId: uid,
    });
    return undefined;
  }
}
