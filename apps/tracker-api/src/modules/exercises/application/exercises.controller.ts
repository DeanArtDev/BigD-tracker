import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/modules/auth/lib';
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
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ExerciseResponse } from './dtos/exercise-response.dto';
import {
  ExerciseWithRepetitionsResponse,
  ExerciseWithRepetitionsResponseSingle,
} from './dtos/exercise-with-repetitions-response.dto';
import { GetExerciseQuery } from './dtos/get-exercise.dto';
import { ExercisesService } from './exercises.service';
import { CreateExerciseWithRepetitionsRequest } from './use-cases/commands/create-exercises-with-repetitions/create-exercises-with-repetitions.dto';
import { DeleteExercisesWithRepetitionsCommand } from './use-cases/commands/delete-exercises-with-repetitions.command';
import { UpdateExerciseWithRepetitionsRequest } from './use-cases/commands/update-exercises-with-repetitions/update-exercises-with-repetitions.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(
    private readonly exercisesService: ExercisesService,

    private readonly deleteExercisesWithRepetitions: DeleteExercisesWithRepetitionsCommand,
  ) {}

  @Get('/templates')
  @ApiOperation({
    summary: 'Получение шаблонов упражнений',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ExerciseResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getExercises(
    @Query() { my = false }: GetExerciseQuery,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<ExerciseResponse> {
    return {
      data: await this.exercisesService.getExercises({ userId: uid, my }),
    };
  }

  @Get('/:exerciseId/repetitions')
  @ApiOperation({
    summary: 'Получение одного упражнения с повторениями',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ExerciseWithRepetitionsResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getOneExerciseWithRepetitions(
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<ExerciseWithRepetitionsResponseSingle> {
    return {
      data: await this.exercisesService.getOneExerciseWithRepetitions({
        id: exerciseId,
        userId: uid,
      }),
    };
  }

  @Post('/repetitions')
  @ApiOperation({
    summary: 'Создание упражнения c повторениями',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ExerciseWithRepetitionsResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createExerciseWithRepetitions(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateExerciseWithRepetitionsRequest,
  ): Promise<ExerciseWithRepetitionsResponseSingle> {
    return {
      data: await this.exercisesService.createExerciseWithRepetitions({ ...data, userId: uid }),
    };
  }

  @Put('/:exerciseId/repetitions')
  @ApiOperation({
    summary: 'Обновление упражнения с повторениями',
    description: 'nullable поля очищают значения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ExerciseWithRepetitionsResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async updateExerciseWithRepetitions(
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: UpdateExerciseWithRepetitionsRequest,
  ): Promise<ExerciseWithRepetitionsResponseSingle> {
    return {
      data: await this.exercisesService.updateExerciseWithRepetitions({
        ...data,
        id: exerciseId,
        userId: uid,
      }),
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
  async deleteExerciseTemplate(
    @Res({ passthrough: true }) res: Response,
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ): Promise<void> {
    await this.deleteExercisesWithRepetitions.execute({ id: exerciseId, userId: uid });
    res.status(HttpStatus.NO_CONTENT).end();
  }
}
