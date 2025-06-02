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
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { mapAndValidateEntityList } from '@shared/lib/map-and-validate-entity-list';
import {
  GetTrainingAggregationResponse,
  GetTrainingsAggregationFilters,
} from './dto/get-training-aggregation.dto';
import { TrainingAggregationDto } from './dto/training-aggregation.dto';
import { TrainingsAggregationMapper } from './trainings-aggregation.mapper';
import { TrainingsAggregationService } from './trainings-aggregation.service';
import {
  CreateTrainingAggregationRequest,
  CreateTrainingAggregationResponse,
  CreateTrainingAggregationUseCase,
} from './use-cases/create-training-aggregation';
import {
  UpdateTrainingAggregationRequest,
  UpdateTrainingAggregationResponse,
  UpdateTrainingAggregationUseCase,
} from './use-cases/update-training-aggregation';

@Controller('/v2/trainings')
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
    type: GetTrainingAggregationResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getTrainings(
    @Query() filters: GetTrainingsAggregationFilters,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GetTrainingAggregationResponse> {
    const trainings = await this.trainingsAggregationService.getTrainings({
      userId: uid,
      ...filters,
    });

    return {
      data: trainings.map(this.trainingAggregationMapper.toDTO),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Создание тренировки',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateTrainingAggregationResponse,
    description: 'Тренировка создана',
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTrainingAggregationRequest,
  ): Promise<CreateTrainingAggregationResponse> {
    const trainings = await this.createTrainingAggregationUseCase.execute(uid, data);

    return {
      data: mapAndValidateEntityList(TrainingAggregationDto, trainings),
    };
  }

  @Put('/:trainingId')
  @ApiOperation({
    summary: 'Полное обновление тренировки',
    description: 'nullable поля очищают значения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Тренировка обновлена',
    type: UpdateTrainingAggregationResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async putTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: UpdateTrainingAggregationRequest,
  ): Promise<UpdateTrainingAggregationResponse> {
    const trainings = await this.updateTrainingAggregationUseCase.execute(uid, data);

    return {
      data: trainings.map(this.trainingAggregationMapper.toDTO),
    };
  }

  @Delete('/:trainingId')
  @ApiOperation({
    summary: 'Удаление тренировки',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Тренировка удалена',
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async deleteTraining(@Param('trainingId', ParseIntPipe) trainingId: number): Promise<void> {
    await this.trainingsAggregationService.deleteTrainingAggregation(trainingId);
    return undefined;
  }
}
