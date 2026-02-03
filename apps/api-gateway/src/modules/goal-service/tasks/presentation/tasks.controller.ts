import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import {
  GoalAssignTaskToGroup,
  GoalCloneTask,
  GoalCreateTask,
  GoalDeleteTask,
  GoalGetAssignableTasksToGroup,
  GoalGetDiaryTasks,
  GoalReplaceTask,
  GoalUnassignTaskFromGroup,
} from '@big-d/api-contracts';
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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import {
  AssignTaskToGroupRes,
  CloneTaskReq,
  CloneTaskRes,
  CreateTaskReq,
  CreateTaskRes,
  GetAssignableTasksQuery,
  GetAssignableTasksRes,
  GetDiaryTasksQuery,
  GetDiaryTasksRes,
  ReplaceTaskReq,
  ReplaceTaskRes,
  UnassignTaskFromGroupRes,
} from './dtos';

@ApiTags('Tasks')
@Controller('/tasks')
export class TasksController {
  constructor(private readonly goalClient: GoalServiceClientProxy) {}

  @Get('/diary')
  @ApiOperation({ summary: 'Получение дел для ежедневника' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetDiaryTasksRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(GetDiaryTasksRes)
  async getDiaryTasks(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Query() { from, to }: GetDiaryTasksQuery,
  ): Promise<GetDiaryTasksRes> {
    return await this.goalClient.send<GoalGetDiaryTasks.Response, GoalGetDiaryTasks.Request>(
      GoalGetDiaryTasks.pattern,
      {
        data: {
          userId: uid,
          from,
          to,
        },
      },
    );
  }

  @Get('/assignable/groups/:groupId')
  @ApiOperation({ summary: 'Получение дел доступных к группировке для одной группы' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAssignableTasksRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(GetAssignableTasksRes)
  async getAssignableTasksToGroup(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() { search }: GetAssignableTasksQuery,
  ): Promise<GetAssignableTasksRes> {
    return await this.goalClient.send<
      GoalGetAssignableTasksToGroup.Response,
      GoalGetAssignableTasksToGroup.Request
    >(GoalGetAssignableTasksToGroup.pattern, {
      data: {
        userId: uid,
        groupId,
        search,
      },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Создание дела' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CreateTaskRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(CreateTaskRes)
  async createTask(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTaskReq,
  ): Promise<CreateTaskRes> {
    return await this.goalClient.send<GoalCreateTask.Response, GoalCreateTask.Request>(
      GoalCreateTask.pattern,
      {
        data: {
          userId: uid,
          groupId: data.groupId,
          priority: data.priority,
          description: data.description,
          name: data.name,
          startDate: data.startDate,
          deadline: data.deadline,
          recurrence: data.recurrence,
          weight: data.weight,
        },
      },
    );
  }

  @Post('/:taskId/clone')
  @ApiOperation({ summary: 'Клонирование дела' })
  @ApiBody({ required: false, type: CloneTaskReq })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CloneTaskRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(CloneTaskRes)
  async cloneTask(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() { data }: CloneTaskReq,
  ): Promise<CloneTaskRes> {
    return await this.goalClient.send<GoalCloneTask.Response, GoalCloneTask.Request>(
      GoalCloneTask.pattern,
      {
        data: {
          userId: uid,
          taskId,
          groupId: data?.groupId,
        },
      },
    );
  }

  @Post('/:taskId/groups/:groupId')
  @ApiOperation({ summary: 'Перемещение дела в группу' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AssignTaskToGroupRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(AssignTaskToGroupRes)
  async assignTaskToGroup(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<AssignTaskToGroupRes> {
    return await this.goalClient.send<
      GoalAssignTaskToGroup.Response,
      GoalAssignTaskToGroup.Request
    >(GoalAssignTaskToGroup.pattern, {
      data: {
        userId: uid,
        taskId,
        groupId,
      },
    });
  }

  @Post('/:taskId/groups/:groupId/unassign')
  @ApiOperation({ summary: 'Открепление дела от группы' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UnassignTaskFromGroupRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(UnassignTaskFromGroupRes)
  async unassignTaskFromGroup(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<UnassignTaskFromGroupRes> {
    return await this.goalClient.send<
      GoalUnassignTaskFromGroup.Response,
      GoalUnassignTaskFromGroup.Request
    >(GoalUnassignTaskFromGroup.pattern, {
      data: {
        userId: uid,
        taskId,
        groupId,
      },
    });
  }

  @Put('/:taskId')
  @ApiOperation({ summary: 'Редактирование дела' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ReplaceTaskRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(ReplaceTaskRes)
  async replaceTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: ReplaceTaskReq,
  ): Promise<ReplaceTaskRes> {
    return await this.goalClient.send<GoalReplaceTask.Response, GoalReplaceTask.Request>(
      GoalReplaceTask.pattern,
      {
        data: {
          id: taskId,
          userId: uid,
          priority: data.priority,
          name: data.name,
          startDate: data.startDate,
          description: data.description,
          deadline: data.deadline,
          weight: data.weight,
          recurrence: data.recurrence,
        },
      },
    );
  }

  @Delete('/:taskId')
  @ApiOperation({ summary: 'Удаление дела' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<void> {
    await this.goalClient.send<GoalDeleteTask.Response, GoalDeleteTask.Request>(
      GoalDeleteTask.pattern,
      { data: { id: taskId, userId: uid } },
    );
    return;
  }
}
