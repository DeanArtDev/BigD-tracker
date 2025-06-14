import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/modules/auth/lib';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  GetTrainingTemplatesDto,
  TrainingTemplateResponse,
  TrainingTemplateResponseSingle,
} from './application/dtos';
import { TrainingTemplatesService } from './domain/training-templates.service';
import { CreateTrainingTemplateWithExercisesRequest } from './application/use-cases';

/*TODO:
 *  [x] получение одной с упражнениями
 *  [x] получение всех с my
 *  [x] создание
 *  [] удаление
 *  [] обновление
 * */
@ApiTags('Training templates')
@Controller('trainings-templates')
export class TrainingTemplatesController {
  constructor(private readonly trainingTemplatesService: TrainingTemplatesService) {}

  @Get()
  @ApiOperation({
    summary: 'Получение шаблонов тренировок',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingTemplateResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getTrainings(
    @Query() { my = false }: GetTrainingTemplatesDto,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingTemplateResponse> {
    return {
      data: await this.trainingTemplatesService.all({ userId: uid, my }),
    };
  }

  @Get('/:templateId')
  @ApiOperation({
    summary: 'Получение одного шаблона тренировки с упражнениями',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TrainingTemplateResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getOneTrainingsWithExercises(
    @Param('templateId', ParseIntPipe) templateId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TrainingTemplateResponseSingle> {
    return {
      data: await this.trainingTemplatesService.oneWithExercises({ userId: uid, id: templateId }),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Создание шаблона тренировки',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TrainingTemplateResponseSingle,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async createTraining(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTrainingTemplateWithExercisesRequest,
  ): Promise<TrainingTemplateResponseSingle> {
    return {
      data: await this.trainingTemplatesService.createOneWithExercises({ ...data, userId: uid }),
    };
  }

  // @Put('/:trainingId')
  // @ApiOperation({
  //   summary: 'Обновление тренировки с упражнениями',
  //   description: 'nullable поля очищают значения',
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Тренировка обновлена',
  //   type: TrainingWithExercisesResponseSingle,
  // })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // async putTraining(
  //   @TokenPayload() { uid }: AccessTokenPayload,
  //   @Param('trainingId', ParseIntPipe) trainingId: number,
  //   @Body() { data }: UpdateTrainingWithExerciseRequest,
  // ): Promise<TrainingWithExercisesResponseSingle> {
  //   return {
  //     data: await this.trainingsService.updateWithExercises({
  //       id: trainingId,
  //       userId: uid,
  //       ...data,
  //     }),
  //   };
  // }
  //
  // @Post('assign')
  // @ApiOperation({
  //   summary: 'Назначение тренировки на дату',
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  // })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // async assignTraining(
  //   @Res({ passthrough: true }) res: Response,
  //   @Body() { data }: AssignTrainingRequest,
  // ): Promise<void> {
  //   await this.assignTrainingCommand.execute(data);
  //   res.status(HttpStatus.OK).end();
  // }
  //
  // @Delete(':trainingId')
  // @ApiOperation({
  //   summary: 'Удаление тренировки',
  // })
  // @ApiResponse({
  //   status: HttpStatus.NO_CONTENT,
  //   description: 'Тренировка удалена',
  // })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // async deleteTraining(
  //   @TokenPayload() { uid }: AccessTokenPayload,
  //   @Param('trainingId', ParseIntPipe) trainingId: number,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<void> {
  //   await this.deleteTrainingCommand.execute(trainingId, uid);
  //   res.status(HttpStatus.NO_CONTENT).end();
  // }
}
