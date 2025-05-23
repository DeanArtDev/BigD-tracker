import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetTrainingsDto } from './dtos/get-trainings.dto';
import { TrainingsService } from './trainings.service';
import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { mapAndValidateEntityList } from '@shared/lib/map-and-validate-entity-list';
import {
  CreateTrainingRequest,
  CreateTrainingResponse,
} from './dtos/create-training.dto';
import { TrainingDto } from './dtos/training.dto';
import { mapRowTrainingToDto } from '@/tranings/utils';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import { PatchTrainingRequest, PatchTrainingResponse } from './dtos/patch-training.dto';

@Controller('trainings')
export class TrainingsController {
  constructor(readonly trainingService: TrainingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получение тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetTrainingsDto,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getTrainings(
    @TokenPayload() tokenPayload: AccessTokenPayload,
  ): Promise<GetTrainingsDto> {
    const rawTrainings = await this.trainingService.getTrainingsByUserId({
      userId: tokenPayload.uid,
    });

    return {
      data: mapAndValidateEntityList(TrainingDto, rawTrainings.map(mapRowTrainingToDto)),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Создание тренировки',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateTrainingResponse,
    description: 'Тренировка создана',
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createTraining(
    @Body() { data }: CreateTrainingRequest,
  ): Promise<CreateTrainingResponse> {
    const rawTraining = await this.trainingService.createTraining({
      userId: data.userId,
      type: data.type,
      description: data.description,
      endDate: data.endDate,
      name: data.name,
      postTrainingDuration: data.postTrainingDuration,
      startDate: data.startDate,
      wormUpDuration: data.wormUpDuration,
    });
    return { data: mapAndValidateEntity(TrainingDto, mapRowTrainingToDto(rawTraining)) };
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
  async deleteTraining(
    @Param('trainingId', ParseIntPipe) trainingId: number,
  ): Promise<void> {
    await this.trainingService.deleteTraining({ id: trainingId });
    return undefined;
  }

  @Patch('/:trainingId')
  @ApiOperation({
    summary: 'Частичное обновление тренировки',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Тренировка обновлена',
    type: PatchTrainingResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async patchTraining(
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @Body() { data }: PatchTrainingRequest,
  ): Promise<PatchTrainingResponse> {
    const rawTraining = await this.trainingService.updateTraining({
      id: trainingId,
      ...data,
    });
    return { data: mapAndValidateEntity(TrainingDto, mapRowTrainingToDto(rawTraining)) };
  }
}
