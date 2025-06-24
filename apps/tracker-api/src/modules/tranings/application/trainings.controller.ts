import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/modules/auth/lib';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetTrainingsQuery } from './dtos/get-trainings.dto';
import { TrainingResponse } from './dtos/training-response.dto';
import {
  TrainingWithExercisesResponse,
  TrainingWithExercisesResponseSingle,
} from './dtos/tranings-with-exercises-response.dto';
import { TrainingsService } from './trainings.service';
import {
  AssignTrainingCommand,
  AssignTrainingRequest,
  CreateTrainingByTemplateRequest,
  CreateTrainingWithExercisesRequest,
  DeleteTrainingCommand,
  UpdateTrainingWithExerciseRequest,
} from './use-cases';
import {
  ProcessTrainingCommand,
  SetRepetitionBreakRequest,
  SetRepetitionFactRequest,
} from './use-cases/commands/process-training';

@ApiTags('Trainings')
@Controller('trainings')
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly deleteTrainingCommand: DeleteTrainingCommand,
    private readonly assignTrainingCommand: AssignTrainingCommand,
    private readonly processTrainingCommand: ProcessTrainingCommand,
  ) {}

  @Get('/active')
  @ApiOperation({
    summary: 'Получение активной тренировки на текущий день',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingWithExercisesResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getActiveTrainings(
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingWithExercisesResponseSingle> {
    return {
      data: await this.trainingsService.getActiveTraining({ userId: uid }),
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Получение тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getTrainings(
    @Query() { from, to }: GetTrainingsQuery,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingResponse> {
    return {
      data: await this.trainingsService.all({ userId: uid, from, to }),
    };
  }

  @Get('/:trainingId')
  @ApiOperation({
    summary: 'Получение одной тренировки с упражнениями',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingWithExercisesResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getOneTrainingsWithExercises(
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingWithExercisesResponseSingle> {
    return {
      data: await this.trainingsService.oneWithExercises({ userId: uid, id: trainingId }),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Создание тренировки',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TrainingWithExercisesResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTrainingWithExercisesRequest,
  ): Promise<TrainingWithExercisesResponseSingle> {
    return {
      data: await this.trainingsService.createWithExercises({ ...data, userId: uid }),
    };
  }

  @Post('/templates')
  @ApiOperation({
    summary: 'Создание тренировки по шаблону',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TrainingWithExercisesResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createTrainingByTemplate(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTrainingByTemplateRequest,
  ): Promise<TrainingWithExercisesResponse> {
    return {
      data: await this.trainingsService.crateTrainingByTemplate({ items: data, userId: uid }),
    };
  }

  @Put('/:trainingId')
  @ApiOperation({
    summary: 'Обновление тренировки с упражнениями',
    description: 'nullable поля очищают значения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Тренировка обновлена',
    type: TrainingWithExercisesResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async putTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @Body() { data }: UpdateTrainingWithExerciseRequest,
  ): Promise<TrainingWithExercisesResponseSingle> {
    return {
      data: await this.trainingsService.updateWithExercises({
        id: trainingId,
        userId: uid,
        ...data,
      }),
    };
  }

  @Post('/assign')
  @ApiOperation({
    summary: 'Назначение тренировки на дату',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  async assignTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: AssignTrainingRequest,
  ): Promise<void> {
    await this.assignTrainingCommand.execute(data, uid);
    return;
  }

  @Post('/:trainingId/start')
  @ApiOperation({
    summary: 'Начать тренировку',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  async stratTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('trainingId', ParseIntPipe) trainingId: number,
  ): Promise<void> {
    await this.processTrainingCommand.start({ userId: uid, id: trainingId });
    return;
  }

  @Post('/:trainingId/finish')
  @ApiOperation({
    summary: 'Завершить тренировку',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  async finishTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('trainingId', ParseIntPipe) trainingId: number,
  ): Promise<void> {
    await this.processTrainingCommand.finish({ userId: uid, id: trainingId });
    return;
  }

  @Post('/:trainingId/repetition/:repetitionId/fact')
  @ApiOperation({
    summary: 'Установить факт',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  async setFact(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('repetitionId', ParseIntPipe) repetitionId: number,
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @Body() { data }: SetRepetitionFactRequest,
  ): Promise<void> {
    await this.processTrainingCommand.setRepetitionFact({
      userId: uid,
      trainingId,
      repetitionId,
      ...data,
    });
    return;
  }

  @Post('/:trainingId/repetition/:repetitionId/break')
  @ApiOperation({
    summary: 'Установить факт отдыха в повторении',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async finishRepetition(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('repetitionId', ParseIntPipe) repetitionId: number,
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @Body() { data }: SetRepetitionBreakRequest,
  ): Promise<void> {
    await this.processTrainingCommand.setRepetitionBreak({
      userId: uid,
      trainingId,
      repetitionId,
      factBreak: data.factBreak,
    });
    return;
  }

  @Delete(':trainingId')
  @ApiOperation({
    summary: 'Удаление тренировки',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Тренировка удалена',
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('trainingId', ParseIntPipe) trainingId: number,
  ): Promise<void> {
    await this.deleteTrainingCommand.execute(trainingId, uid);
    return;
  }
}
