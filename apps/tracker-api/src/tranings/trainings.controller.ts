import { TokenPayload } from '@/auth/decorators';
import { AccessTokenPayload } from '@/auth/dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from '@/auth/lib';
import { AssignTrainingRequest } from '@/tranings/dtos/assign-training.dto';
import { Body, Controller, Delete, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AssignTrainingTemplateRequest } from './dtos/assign-training-template.dto';
import { TrainingsMapper } from './trainings.mapper';
import { TrainingsService } from './trainings.service';

@Controller('trainings')
export class TrainingsController {
  constructor(
    readonly trainingService: TrainingsService,
    readonly trainingsMapper: TrainingsMapper,
  ) {}

  @Post('templates/assign')
  @ApiOperation({
    summary: 'Назначение шаблона на дату',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async assignTrainingTemplate(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: AssignTrainingTemplateRequest,
  ) {
    for (const item of data) {
      await this.trainingService.setStartDataAtTemplate({ ...item, userId: uid });
    }
    return undefined;
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Назначение тренировки на дату',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async assignTraining(@Body() { data }: AssignTrainingRequest) {
    for (const item of data) {
      await this.trainingService.setStartDataAtTraining(item);
    }
    return undefined;
  }

  @Delete('templates/:templateId')
  @ApiOperation({
    summary: 'Удаление шаблона тренировки',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Шаблон тренировки удален',
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async deleteTemplateTraining(
    @Param('templateId', ParseIntPipe) templateId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<void> {
    await this.trainingService.deleteTrainingTemplate({ id: templateId, userId: uid });
    return undefined;
  }
}
