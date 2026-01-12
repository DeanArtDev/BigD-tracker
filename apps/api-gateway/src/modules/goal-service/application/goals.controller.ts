import { GOAL_SERVICE_RMQ_KEY } from '@big-d/api-contracts';
import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Goals')
@Controller('goals')
export class GoalsController {
  constructor(@Inject(GOAL_SERVICE_RMQ_KEY) private readonly goalClient: ClientProxy) {}
  //
  // @Get('/:goalId')
  // @ApiOperation({
  //   summary: 'Получение цели по id',
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: GoalResSingle,
  // })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // @ValidateRpcResponse(GoalResSingle)
  // async getGoalById(
  //   @Param('goalId', ParseIntPipe) goalId: number,
  //   @TokenPayload() { uid }: AccessTokenPayload,
  // ): Promise<GoalResSingle> {
  //   return await firstValueFrom(
  //     this.goalClient.send<GoalGetGroupById.Response, GoalGetGroupById.Request>(
  //       GoalGetGroupById.pattern,
  //       { data: { id: goalId, userId: uid } },
  //     ),
  //   );
  // }
  //
  // @Get()
  // @ApiOperation({ summary: 'Получение целей юзера' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: GoalRes,
  // })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // @ValidateRpcResponse(GoalRes)
  // async getUsersGoals(@TokenPayload() { uid }: AccessTokenPayload): Promise<GoalRes> {
  //   return await firstValueFrom(
  //     this.goalClient.send<GoalGetGroupByUserId.Response, GoalGetGroupByUserId.Request>(
  //       GoalGetGroupByUserId.pattern,
  //       { data: { userId: uid } },
  //     ),
  //   );
  // }
  //
  // @Post()
  // @ApiOperation({ summary: 'Создание цели' })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   type: CreateGoalRes,
  // })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // @HttpCode(HttpStatus.CREATED)
  // @ValidateRpcResponse(CreateGoalRes)
  // async createGoal(
  //   @TokenPayload() { uid }: AccessTokenPayload,
  //   @Body() { data }: CreateGoalReq,
  // ): Promise<CreateGoalRes> {
  //   return await firstValueFrom(
  //     this.goalClient.send<GoalCreateGoal.Response, GoalCreateGoal.Request>(
  //       GoalCreateGoal.pattern,
  //       {
  //         data: {
  //           name: data.name,
  //           description: data.description,
  //           userId: uid,
  //         },
  //       },
  //     ),
  //   );
  // }
  //
  // @Post('/:goalId/start')
  // @ApiOperation({ summary: 'Начать цель' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: StartGoalRes,
  // })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // @HttpCode(HttpStatus.OK)
  // @ValidateRpcResponse(StartGoalRes)
  // async startGoal(
  //   @Param('goalId', ParseIntPipe) goalId: number,
  //   @TokenPayload() { uid }: AccessTokenPayload,
  //   @Body() { data }: StartGoalReq,
  // ): Promise<StartGoalRes> {
  //   return await firstValueFrom(
  //     this.goalClient.send<GoalStartGoal.Response, GoalStartGoal.Request>(GoalStartGoal.pattern, {
  //       data: {
  //         id: goalId,
  //         userId: uid,
  //         startDate: data.startDate,
  //         deadline: data.deadline,
  //       },
  //     }),
  //   );
  // }
  //
  // @Post('/:goalId/finish')
  // @ApiOperation({ summary: 'Закончить цель' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: FinishGoalRes,
  // })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // @HttpCode(HttpStatus.OK)
  // @ValidateRpcResponse(FinishGoalRes)
  // async finishGoal(
  //   @Param('goalId', ParseIntPipe) goalId: number,
  //   @TokenPayload() { uid }: AccessTokenPayload,
  //   @Body() { data }: FinishGoalReq,
  // ): Promise<FinishGoalRes> {
  //   return await firstValueFrom(
  //     this.goalClient.send<GoalFinishGoal.Response, GoalFinishGoal.Request>(
  //       GoalFinishGoal.pattern,
  //       {
  //         data: {
  //           id: goalId,
  //           userId: uid,
  //           endDate: data.endDate,
  //         },
  //       },
  //     ),
  //   );
  // }
  //
  // @Delete(':goalId')
  // @ApiOperation({ summary: 'Удаление цели' })
  // @ApiResponse({ status: HttpStatus.NO_CONTENT })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteGroup(
  //   @Param('goalId', ParseIntPipe) goalId: number,
  //   @TokenPayload() { uid }: AccessTokenPayload,
  // ): Promise<void> {
  //   await firstValueFrom(
  //     this.goalClient.send<GoalDeleteGoal.Response, GoalDeleteGoal.Request>(
  //       GoalDeleteGoal.pattern,
  //       { data: { id: goalId, userId: uid } },
  //     ),
  //   );
  //   return;
  // }
}
