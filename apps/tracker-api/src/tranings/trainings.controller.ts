import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import {
  PutTrainingTemplateRequest,
  PutTrainingTemplateResponse,
} from '@/tranings/dtos/put-training-template.dto';
import { TrainingsMapper } from '@/tranings/trainings.mapper';
import { mapRawTrainingTemplateToDto } from '@/tranings/utils';
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
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { mapAndValidateEntityList } from '@shared/lib/map-and-validate-entity-list';
import {
  CreateTrainingTemplateRequest,
  CreateTrainingTemplateResponse,
} from './dtos/create-training-templates.dto';
import {
  GetTrainingsTemplatesQuery,
  GetTrainingsTemplatesResponse,
} from './dtos/get-trainings-templates.dto';
import { TrainingTemplateDto } from './dtos/training-template.dto';
import { TrainingsService } from './trainings.service';

@Controller('trainings')
export class TrainingsController {
  constructor(
    readonly trainingService: TrainingsService,
    readonly trainingsMapper: TrainingsMapper,
  ) {}

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
    const rawTrainings = await this.trainingService.findTemplatesByFilters({
      userId: query?.my === true ? tokenPayload.uid : undefined,
    });
    return {
      data: mapAndValidateEntityList(
        TrainingTemplateDto,
        rawTrainings.map(mapRawTrainingTemplateToDto),
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
    const rawTemplate = await this.trainingService.createTrainingTemplate({
      userId: data.userId,
      type: data.type,
      description: data.description,
      name: data.name,
      postTrainingDuration: data.postTrainingDuration,
      wormUpDuration: data.wormUpDuration,
    });
    return {
      data: mapAndValidateEntity(TrainingTemplateDto, mapRawTrainingTemplateToDto(rawTemplate)),
    };
  }

  @Put('/templates/:templateId')
  @ApiOperation({
    summary: 'Полное обновление шаблона тренировки',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Шаблон тренировки обновлен',
    type: PutTrainingTemplateResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async patchTrainingTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() { data }: PutTrainingTemplateRequest,
  ): Promise<PutTrainingTemplateResponse> {
    const rawTemplate = await this.trainingService.updateTrainingTemplateAndReplace(templateId, {
      name: data.name,
      type: data.type,
      description: data.description ?? null,
      wormUpDuration: data.wormUpDuration ?? null,
      postTrainingDuration: data.postTrainingDuration ?? null,
    });

    return {
      data: mapAndValidateEntity(TrainingTemplateDto, mapRawTrainingTemplateToDto(rawTemplate)),
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
