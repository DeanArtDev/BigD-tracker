import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import {
  PutTrainingRequest,
  PutTrainingResponse,
} from '@/tranings/dtos/put-training.dto';
import { mapRowTrainingTemplateToDto, mapRowTrainingToDto } from '@/tranings/utils';
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
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { mapAndValidateEntityList } from '@shared/lib/map-and-validate-entity-list';
import {
  CreateTrainingRequest,
  CreateTrainingResponse,
} from './dtos/create-training.dto';
import {
  GetTrainingsTemplatesResponse,
  TrainingTemplateDto,
} from './dtos/get-trainings-templates.dto';
import { GetTrainingsFilters, GetTrainingsResponse } from './dtos/get-trainings.dto';
import { PatchTrainingRequest, PatchTrainingResponse } from './dtos/patch-training.dto';
import { TrainingDto } from './dtos/training.dto';
import { TrainingsService } from './trainings.service';

@Controller('trainings')
export class TrainingsController {
  constructor(readonly trainingService: TrainingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получение тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetTrainingsResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getTrainings(
    @Query() filters: GetTrainingsFilters,
    @TokenPayload() tokenPayload: AccessTokenPayload,
  ): Promise<GetTrainingsResponse> {
    const rawTrainings = await this.trainingService.getTrainingsByFilters(
      {
        userId: tokenPayload.uid,
      },
      filters,
    );

    return {
      data: mapAndValidateEntityList(TrainingDto, rawTrainings.map(mapRowTrainingToDto)),
    };
  }

  @Get('/templates')
  @ApiOperation({
    summary: 'Получение шаблонов тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetTrainingsTemplatesResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getTrainingsTemplates(
    @TokenPayload() tokenPayload: AccessTokenPayload,
  ): Promise<GetTrainingsTemplatesResponse> {
    const rawTrainings = await this.trainingService.getTrainingsByFilters(
      { userId: tokenPayload.uid },
      { onlyTemplate: true },
    );

    return {
      data: mapAndValidateEntityList(
        TrainingTemplateDto,
        rawTrainings.map(mapRowTrainingTemplateToDto),
      ),
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

  @Put('/:trainingId')
  @ApiOperation({
    summary: 'Полное обновление тренировки',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Тренировка обновлена',
    type: PutTrainingResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async putTraining(
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @Body() { data }: PutTrainingRequest,
  ): Promise<PutTrainingResponse> {
    const rawTraining = await this.trainingService.updateTrainingFully({
      id: trainingId,
      type: data.type,
      name: data.name,
      endDate: data.endDate ?? null,
      startDate: data.startDate ?? null,
      description: data.description ?? null,
      wormUpDuration: data.wormUpDuration ?? null,
      postTrainingDuration: data.postTrainingDuration ?? null,
    });
    return { data: mapAndValidateEntity(TrainingDto, mapRowTrainingToDto(rawTraining)) };
  }
}
