import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrainingTemplateAggregationResponse } from './dto/response-tarining-aggregation.dto';
import { TrainingTemplateAggregationMapper } from './training-template-aggregation.mapper';
import { TrainingTemplateAggregationService } from './training-template-aggregation.service';
import {
  CreateTrainingTemplateAggregationRequest,
  CreateTrainingTemplateAggregationUseCase,
} from './use-cases/create-training-aggregation';

@ApiTags('Trainings')
@Controller('/trainings')
export class TrainingTemplateAggregationController {
  constructor(
    private readonly createTrainingTemplateAggregationUseCase: CreateTrainingTemplateAggregationUseCase,
    private readonly trainingTemplateAggregationService: TrainingTemplateAggregationService,
    private readonly trainingTemplateAggregationMapper: TrainingTemplateAggregationMapper,
  ) {}

  @Get('/templates')
  @ApiOperation({
    summary: 'Получение шаблонов тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingTemplateAggregationResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getTrainingsTemplates(@TokenPayload() { uid }: AccessTokenPayload) {
    const templates = await this.trainingTemplateAggregationService.getTrainings({ userId: uid });

    return {
      data: templates.map(this.trainingTemplateAggregationMapper.fromEntityToDTO),
    };
  }

  @Post('/templates')
  @ApiOperation({
    summary: 'Создание шаблона тренировки',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TrainingTemplateAggregationResponse,
    description: 'Тренировка создана',
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
}
