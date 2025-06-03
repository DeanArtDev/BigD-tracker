import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import { ExerciseTemplateDto } from '@/exercises/dtos/exercise-template.dto';
import {
  PatchExerciseTemplateRequest,
  PatchExerciseTemplateResponse,
} from '@/exercises/dtos/patch-exercise-template.dto';
import {
  PutExerciseTemplateRequest,
  PutExerciseTemplateResponse,
} from '@/exercises/dtos/put-exercise-template.dto';
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
  GetExerciseTemplatesQuery,
} from './dtos/create-exercises-template.dto';
import { ExercisesService } from './exercises.service';
import { mapRawExerciseTemplateToDto } from './utils';
import { ExercisesTemplatesResponse } from './dtos/reaponse-exercises-templates.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(readonly exercisesService: ExercisesService) {}

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
    @TokenPayload() tokenPayload: AccessTokenPayload,
    @Body() { data }: CreateExerciseTemplateRequest,
  ) {
    const rawExercises = await this.exercisesService.createExerciseTemplate(data);

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

  @Put('/templates/:templateId')
  @ApiOperation({
    summary: 'Полное обновление шаблона упражнения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PutExerciseTemplateResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async updateExerciseTemplateAndReplace(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() { data }: PutExerciseTemplateRequest,
  ): Promise<PutExerciseTemplateResponse> {
    const rawExercises = await this.exercisesService.updateTemplateAndReplace(templateId, {
      type: data.type,
      name: data.name,
      exampleUrl: data.exampleUrl ?? null,
      description: data?.description ?? null,
    });

    return {
      data: mapAndValidateEntity(ExerciseTemplateDto, mapRawExerciseTemplateToDto(rawExercises)),
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
