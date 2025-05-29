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
  CreateTrainingTemplateRequest,
  CreateTrainingTemplateResponse,
} from './dtos/create-training-templates.dto';
import {
  CreateTrainingRequest,
  CreateTrainingResponse,
} from './dtos/create-training.dto';
import {
  GetTrainingsTemplatesQuery,
  GetTrainingsTemplatesResponse,
} from './dtos/get-trainings-templates.dto';
import { GetTrainingsFilters, GetTrainingsResponse } from './dtos/get-trainings.dto';
import { PatchTrainingRequest, PatchTrainingResponse } from './dtos/patch-training.dto';
import { TrainingTemplateDto } from './dtos/training-template.dto';
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
    const rawTrainings = await this.trainingService.filterByRangeForUser({
      userId: tokenPayload.uid,
      ...filters,
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
    const rawTraining = await this.trainingService.updateTrainingPartly(trainingId, data);
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
    const rawTraining = await this.trainingService.updateTrainingAndReplace(trainingId, {
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

  @Get('/templates')
  @ApiOperation({
    summary: 'Получение шаблонов тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetTrainingsTemplatesResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async geTrainingsTemplates(
    @Query() query: GetTrainingsTemplatesQuery,
    @TokenPayload() tokenPayload: AccessTokenPayload,
  ): Promise<GetTrainingsTemplatesResponse> {
    if (query?.my) {
      const rawTrainings = await this.trainingService.getTemplatesByUserId(
        tokenPayload.uid,
      );
      return {
        data: mapAndValidateEntityList(
          TrainingTemplateDto,
          rawTrainings.map(mapRowTrainingTemplateToDto),
        ),
      };
    }

    const rawTrainings = await this.trainingService.getCommonTemplates();
    return {
      data: mapAndValidateEntityList(
        TrainingTemplateDto,
        rawTrainings.map(mapRowTrainingTemplateToDto),
      ),
    };
  }

  @Post('/templates')
  @ApiOperation({
    summary: 'Создание шаблона тренировки',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateTrainingTemplateResponse,
    description: 'Шаблон тренировка создана',
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createTrainingTemplate(
    @Body() { data }: CreateTrainingTemplateRequest,
  ): Promise<CreateTrainingTemplateResponse> {
    const rawTraining = await this.trainingService.createTrainingTemplate({
      userId: data.userId,
      type: data.type,
      description: data.description,
      name: data.name,
      postTrainingDuration: data.postTrainingDuration,
      wormUpDuration: data.wormUpDuration,
    });
    return {
      data: mapAndValidateEntity(
        TrainingTemplateDto,
        mapRowTrainingTemplateToDto(rawTraining),
      ),
    };
  }

  @Delete('/templates/:trainingId')
  @ApiOperation({
    summary: 'Удаление шаблона тренировки',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Шаблон тренировки удален',
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async deleteTemplateTraining(
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<void> {
    await this.trainingService.deleteTrainingTemplate({ id: trainingId, userId: uid });
    return undefined;
  }
}
