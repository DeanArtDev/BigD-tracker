import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import {
  CreateExerciseRequest,
  CreateExerciseResponse,
} from '@/exercises/dtos/create-exercises.dto';
import { ExerciseTemplateDto } from '@/exercises/dtos/exercise-template.dto';
import { GetExercisesResponse } from '@/exercises/dtos/get-exercises.dto';
import {
  PatchExerciseTemplateRequest,
  PatchExerciseTemplateResponse,
} from '@/exercises/dtos/patch-exercise-template.dto';
import {
  PutExerciseTemplateRequest,
  PutExerciseTemplateResponse,
} from '@/exercises/dtos/put-exercise-template.dto';
import {
  PutExerciseRequest,
  PutExerciseResponse,
} from '@/exercises/dtos/put-exercise.dto';
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
import { ExerciseDto } from './dtos/exercise.dto';
import { GetExercisesTemplatesResponse } from './dtos/get-exercises-templates.dto';
import { PatchExerciseRequest, PatchExerciseResponse } from './dtos/patch-exercise.dto';
import { ExercisesService } from './exercises.service';
import { mapRawExerciseTemplateToDto, mapRawExerciseToDto } from './utils';

@Controller('exercises')
export class ExercisesController {
  constructor(readonly exercisesService: ExercisesService) {}

  @Get()
  @ApiOperation({
    summary: 'Получение упражнений',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetExercisesResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getExercises(
    @TokenPayload() tokenPayload: AccessTokenPayload,
  ): Promise<GetExercisesResponse> {
    const rawExercises = await this.exercisesService.getExercises({
      userId: tokenPayload.uid,
    });

    return {
      data: mapAndValidateEntityList(ExerciseDto, rawExercises.map(mapRawExerciseToDto)),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Создание упражнения',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateExerciseResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createExercise(
    @TokenPayload() tokenPayload: AccessTokenPayload,
    @Body() { data }: CreateExerciseRequest,
  ): Promise<CreateExerciseResponse> {
    const rawExercises = await this.exercisesService.createExercise(data);

    return {
      data: mapAndValidateEntity(ExerciseDto, mapRawExerciseToDto(rawExercises)),
    };
  }

  @Patch('/:exerciseId')
  @ApiOperation({
    summary: 'Частичное обновление упражнения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PatchExerciseResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async updateExercisePartly(
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() { data }: PatchExerciseRequest,
  ): Promise<PatchExerciseResponse> {
    const rawExercises = await this.exercisesService.updatePartly(exerciseId, data);

    return {
      data: mapAndValidateEntity(ExerciseDto, mapRawExerciseToDto(rawExercises)),
    };
  }

  @Put('/:exerciseId')
  @ApiOperation({
    summary: 'Полное обновление упражнения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PutExerciseResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async updateExerciseAndReplace(
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() { data }: PutExerciseRequest,
  ): Promise<PutExerciseResponse> {
    const rawExercises = await this.exercisesService.updateAndReplace(exerciseId, {
      type: data.type,
      name: data.name,
      trainingId: data.trainingId,
      exampleUrl: data.exampleUrl ?? null,
      description: data?.description ?? null,
    });

    return {
      data: mapAndValidateEntity(ExerciseDto, mapRawExerciseToDto(rawExercises)),
    };
  }

  @Delete('/:exerciseId')
  @ApiOperation({
    summary: 'Удаление упражнения',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async deleteExercise(
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ): Promise<void> {
    await this.exercisesService.deleteExercise(exerciseId);
    return undefined;
  }

  // Templates

  @Get('/templates')
  @ApiOperation({
    summary: 'Получение шаблонов упражнений',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetExercisesTemplatesResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getExerciseTemplates(
    @Query() { my }: GetExerciseTemplatesQuery,
    @TokenPayload() tokenPayload: AccessTokenPayload,
  ): Promise<GetExercisesTemplatesResponse> {
    const rawExercises = await this.exercisesService.getExercisesTemplates({
      userId: my ? tokenPayload.uid : undefined,
    });

    return {
      data: mapAndValidateEntityList(
        ExerciseTemplateDto,
        rawExercises.map(mapRawExerciseTemplateToDto),
      ),
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
      data: mapAndValidateEntity(
        ExerciseTemplateDto,
        mapRawExerciseTemplateToDto(rawExercises),
      ),
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
    const rawExercises = await this.exercisesService.updateTemplatePartly(
      templateId,
      data,
    );

    return {
      data: mapAndValidateEntity(
        ExerciseTemplateDto,
        mapRawExerciseTemplateToDto(rawExercises),
      ),
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
    const rawExercises = await this.exercisesService.updateTemplateAndReplace(
      templateId,
      {
        type: data.type,
        name: data.name,
        exampleUrl: data.exampleUrl ?? null,
        description: data?.description ?? null,
      },
    );

    return {
      data: mapAndValidateEntity(
        ExerciseTemplateDto,
        mapRawExerciseTemplateToDto(rawExercises),
      ),
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
