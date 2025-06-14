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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetTrainingsQuery } from './dtos/get-trainings.dto';
import { TrainingResponse } from './dtos/tarining-response.dto';
import { TrainingWithExercisesResponseSingle } from './dtos/tranings-with-exercises-response.dto';
import { TrainingsService } from './trainings.service';
import { AssignTrainingCommand } from './use-cases/commands/assign-training/assign-training.command';
import { AssignTrainingRequest } from './use-cases/commands/assign-training/assign-training.dto';
import { CreateTrainingWithExercisesRequest } from './use-cases/commands/create-training-with-exercises/create-training-with-exercises.dto';
import { DeleteTrainingCommand } from './use-cases/commands/delete-training.command';
import { UpdateTrainingWithExerciseRequest } from './use-cases/commands/update-training-with-exericse/update-training-with-exericse.dto';
/*TODO:
 *  [] создание тренировки по шаблону
 * */
@ApiTags('Trainings')
@Controller('trainings')
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly deleteTrainingCommand: DeleteTrainingCommand,
    private readonly assignTrainingCommand: AssignTrainingCommand,
  ) {}

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

  @Post('assign')
  @ApiOperation({
    summary: 'Назначение тренировки на дату',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async assignTraining(
    @Res({ passthrough: true }) res: Response,
    @Body() { data }: AssignTrainingRequest,
  ): Promise<void> {
    await this.assignTrainingCommand.execute(data);
    res.status(HttpStatus.OK).end();
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
  async deleteTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.deleteTrainingCommand.execute(trainingId, uid);
    res.status(HttpStatus.NO_CONTENT).end();
  }
}
