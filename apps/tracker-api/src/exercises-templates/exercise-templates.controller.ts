import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import { mapAndValidateEntityList } from '@/shared/lib/map-and-validate-entity-list';
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
import {
  CreateExerciseTemplateRequest,
  CreateExerciseTemplateResponse,
} from './dtos/create-exercises-template.dto';
import { ExerciseTemplateDto } from './dtos/exercise-template.dto';
import { GetExerciseTemplatesQuery } from './dtos/get-exercise-templates.dto';
import { PutExerciseTemplateRequest } from './dtos/put-exercise-template.dto';
import {
  ExercisesTemplatesResponse,
  ExercisesTemplatesResponseSingle,
} from './dtos/reaponse-exercises-templates.dto';
import { ExercisesTemplateMapper } from './exercise-template.mapper';
import { ExerciseTemplateService } from './exercise-template.service';

@Controller('exercises')
export class ExerciseTemplatesController {
  constructor(
    readonly exercisesTemplateMapper: ExercisesTemplateMapper,
    readonly exercisesService: ExerciseTemplateService,
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
    @Query() { my = false }: GetExerciseTemplatesQuery,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<ExercisesTemplatesResponse> {
    const rawExercises = await this.exercisesService.getExercisesTemplates(uid, { my });

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
    const exercise = await this.exercisesService.createExerciseTemplate({
      userId: uid,
      ...data,
    });

    return {
      data: this.exercisesTemplateMapper.fromEntityToDTO(exercise),
    };
  }

  @Put('/templates/:templateId')
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
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() { data }: PutExerciseTemplateRequest,
  ): Promise<ExercisesTemplatesResponseSingle> {
    const exercise = await this.exercisesService.updateTemplate(templateId, data);

    return {
      data: this.exercisesTemplateMapper.fromEntityToDTO(exercise),
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
