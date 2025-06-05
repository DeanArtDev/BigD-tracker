import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import { ExerciseTemplateDto } from './dtos/exercise-template.dto';
import {
  PatchExerciseTemplateRequest,
  PatchExerciseTemplateResponse,
} from '@/exercises/dtos/patch-exercise-template.dto';
import { PutExerciseTemplateRequest } from './dtos/put-exercise-template.dto';
import { ExercisesTemplateMapper } from './exercise-template.mapper';
import { mapAndValidateEntityList } from '@/shared/lib/map-and-validate-entity-list';
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
import {
  CreateExerciseTemplateRequest,
  CreateExerciseTemplateResponse,
} from './dtos/create-exercises-template.dto';
import { GetExerciseTemplatesQuery } from './dtos/get-exercise-templates.dto';
import { ExercisesTemplatesResponse } from './dtos/reaponse-exercises-templates.dto';
import { ExercisesService } from './exercises.service';
import { mapRawExerciseTemplateToDto } from './utils';

@Controller('exercises')
export class ExercisesController {
  constructor(
    readonly exercisesTemplateMapper: ExercisesTemplateMapper,
    readonly exercisesService: ExercisesService,
  ) {}

  @Get('/templates')
  @ApiOperation({
    summary: 'Получение шаблонов упражнений',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ExercisesTemplatesResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getExerciseTemplates(
    @Query() { my }: GetExerciseTemplatesQuery,
    @TokenPayload() tokenPayload: AccessTokenPayload,
  ): Promise<ExercisesTemplatesResponse> {
    const rawExercises = await this.exercisesService.getExercisesTemplates({
      userId: my === true ? tokenPayload.uid : undefined,
    });

    return {
      data: mapAndValidateEntityList(ExerciseTemplateDto, rawExercises),
    };
  }

  @Post('/templates')
  @ApiOperation({
    summary: 'Создание шаблона упражнения',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateExerciseTemplateResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createExerciseTemplate(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateExerciseTemplateRequest,
  ) {
    const rawExercises = await this.exercisesService.createExerciseTemplate({
      userId: uid,
      ...data,
    });

    return {
      data: mapAndValidateEntity(ExerciseTemplateDto, mapRawExerciseTemplateToDto(rawExercises)),
    };
  }

  @Patch('/templates/:templateId')
  @ApiOperation({
    summary: 'Частичное обновление шаблона упражнения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PatchExerciseTemplateResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async updateExerciseTemplatePartly(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() { data }: PatchExerciseTemplateRequest,
  ): Promise<PatchExerciseTemplateResponse> {
    const rawExercises = await this.exercisesService.updateTemplatePartly(templateId, data);

    return {
      data: mapAndValidateEntity(ExerciseTemplateDto, mapRawExerciseTemplateToDto(rawExercises)),
    };
  }

  @Put('/templates')
  @ApiOperation({
    summary: 'Обновление шаблонов упражнения',
    description: 'nullable поля очищают значения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ExercisesTemplatesResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async updateExerciseTemplateAndReplace(
    @Body() { data }: PutExerciseTemplateRequest,
  ): Promise<ExercisesTemplatesResponse> {
    const exercises = await this.exercisesService.updateTemplates(data);

    return {
      data: exercises.map(this.exercisesTemplateMapper.fromEntityToDTO),
    };
  }

  @Delete('/templates/:templateId')
  @ApiOperation({
    summary: 'Удаление шаблона упражнения',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async deleteExerciseTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
  ): Promise<void> {
    await this.exercisesService.deleteExerciseTemplate(templateId);
    return undefined;
  }
}
