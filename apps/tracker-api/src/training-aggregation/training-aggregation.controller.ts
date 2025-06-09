import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
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
import { AssignTrainingAggregationRequest } from './dto/assign-training-aggregation.dto';
import { GetTrainingsAggregationFilters } from './dto/get-training-aggregation.dto';
import {
  TrainingAggregationResponse,
  TrainingAggregationResponseSingle,
} from './dto/response-tarining-aggregation.dto';
import { TrainingsAggregationMapper } from './trainings-aggregation.mapper';
import { TrainingsAggregationService } from './trainings-aggregation.service';
import {
  CreateTrainingAggregationRequest,
  CreateTrainingAggregationUseCase,
} from './use-cases/create-training-aggregation';
import {
  UpdateTrainingAggregationRequest,
  UpdateTrainingAggregationUseCase,
} from './use-cases/update-training-aggregation';

@ApiTags('Trainings')
@Controller('trainings')
export class TrainingAggregationController {
  constructor(
    private readonly createTrainingAggregationUseCase: CreateTrainingAggregationUseCase,
    private readonly updateTrainingAggregationUseCase: UpdateTrainingAggregationUseCase,
    private readonly trainingsAggregationService: TrainingsAggregationService,
    private readonly trainingAggregationMapper: TrainingsAggregationMapper,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Получение тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingAggregationResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getTrainings(
    @Query() filters: GetTrainingsAggregationFilters,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingAggregationResponse> {
    const trainings = await this.trainingsAggregationService.getTrainings(uid, filters);

    return {
      data: trainings.map(this.trainingAggregationMapper.fromEntityToDTO),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Создание тренировки',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TrainingAggregationResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTrainingAggregationRequest,
  ): Promise<TrainingAggregationResponseSingle> {
    const training = await this.createTrainingAggregationUseCase.execute(uid, data);

    return {
      data: this.trainingAggregationMapper.fromEntityToDTO(training),
    };
  }

  @Put()
  @ApiOperation({
    summary: 'Обновление тренировок',
    description: 'nullable поля очищают значения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Тренировка обновлена',
    type: TrainingAggregationResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async putTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: UpdateTrainingAggregationRequest,
  ): Promise<TrainingAggregationResponse> {
    const trainings = await this.updateTrainingAggregationUseCase.execute(uid, data);

    return {
      data: trainings.map(this.trainingAggregationMapper.fromEntityToDTO),
    };
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Назначение тренировки на дату',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async assignTraining(@Body() { data }: AssignTrainingAggregationRequest) {
    for (const item of data) {
      await this.trainingsAggregationService.setStartDataAtTraining(item);
    }
    return undefined;
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
  async deleteTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('trainingId', ParseIntPipe) trainingId: number,
  ): Promise<void> {
    await this.trainingsAggregationService.deleteTrainingAggregation(trainingId, uid);
    return undefined;
  }
}
