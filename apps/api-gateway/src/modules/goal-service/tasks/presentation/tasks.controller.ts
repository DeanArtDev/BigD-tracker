import { AppRmqClient } from '@/infrastructure/rmq-clients';
import { GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients/clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import {
  GoalAssignTaskToGroup,
  GoalCloneTask,
  GoalCompleteDeleteTask,
  GoalCreateTask,
  GoalDeleteTask,
  GoalFinishTask,
  GoalGetAssignableTasks,
  GoalGetTasks,
  GoalReplaceTask,
  GoalTaskRecovery,
  GoalUnassignTaskFromGroup,
  TaskStatus,
} from '@big-d/api-contracts';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
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
  CompleteDeleteTaskRes,
  CreateTaskReq,
  CreateTaskRes,
  FinishTaskRes,
  GetArchivedTasksQuery,
  GetArchivedTasksRes,
  GetAssignableTasksQuery,
  GetAssignableTasksRes,
  GetDeletedTasksQuery,
  GetDeletedTasksRes,
  GetTasksQuery,
  GetTasksRes,
  ReplaceTaskReq,
  ReplaceTaskRes,
  TaskRecoveryReq,
  TaskRecoveryRes,
  UnassignTaskFromGroupRes,
} from './dtos';

@ApiTags('Tasks')
@Controller('/tasks')
export class TasksController {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Get()
  @ApiOperation({ summary: 'Получение дел' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetTasksRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(GetTasksRes)
  async getTasks(
    @Query() query: GetTasksQuery,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GetTasksRes> {
    const availableStatuses = [
      TaskStatus.NOT_STARTED,
      TaskStatus.IN_PROGRESS,
      TaskStatus.COMPLETED,
      TaskStatus.OVERDUE,
      TaskStatus.CANCELLED,
    ];

    const status =
      query.filter?.status?.filter((i) => availableStatuses.includes(i)) ?? availableStatuses;
    const filter = { ...(query?.filter ?? {}), status };

    return await this.goalClient.send<GoalGetTasks.Response, GoalGetTasks.Request>(
      GoalGetTasks.pattern,
      {
        data: {
          userId: uid,
          search: query.search,
          sort: query.sort,
          filter,
          page: query.page,
          perPage: query.perPage,
        },
      },
    );
  }

  @Get('/deleted')
  @ApiOperation({ summary: 'Получение удаленных дел' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetDeletedTasksRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(GetDeletedTasksRes)
  async getDeletedTasks(
    @Query() query: GetDeletedTasksQuery,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GetDeletedTasksRes> {
    return await this.goalClient.send<GoalGetTasks.Response, GoalGetTasks.Request>(
      GoalGetTasks.pattern,
      {
        data: {
          userId: uid,
          filter: { status: [TaskStatus.DELETED] },
          page: query.page,
          perPage: query.perPage,
        },
      },
    );
  }

  @Get('/archived')
  @ApiOperation({ summary: 'Получение архивные дел' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetArchivedTasksRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(GetArchivedTasksRes)
  async getArchivedTasks(
    @Query() query: GetArchivedTasksQuery,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GetArchivedTasksRes> {
    return await this.goalClient.send<GoalGetTasks.Response, GoalGetTasks.Request>(
      GoalGetTasks.pattern,
      {
        data: {
          userId: uid,
          filter: { status: [TaskStatus.ARCHIVED] },
          page: query.page,
          perPage: query.perPage,
        },
      },
    );
  }

  @Get('/assignable')
  @ApiOperation({ summary: 'Получение дел доступных к группировке' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAssignableTasksRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(GetAssignableTasksRes)
  async getAssignableTasks(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Query() { search }: GetAssignableTasksQuery,
  ): Promise<GetAssignableTasksRes> {
    return await this.goalClient.send<
      GoalGetAssignableTasks.Response,
      GoalGetAssignableTasks.Request
    >(GoalGetAssignableTasks.pattern, {
      data: {
        userId: uid,
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

  @Post('/:taskId/finish')
  @ApiOperation({ summary: 'Завершение дела' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FinishTaskRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(FinishTaskRes)
  async finishTask(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<FinishTaskRes> {
    return await this.goalClient.send<GoalFinishTask.Response, GoalFinishTask.Request>(
      GoalFinishTask.pattern,
      {
        data: {
          userId: uid,
          taskId,
        },
      },
    );
  }

  @Post('/:taskId/recovery')
  @ApiOperation({ summary: 'Восстановление дела' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TaskRecoveryRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(TaskRecoveryRes)
  async taskRecovery(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() { data }: TaskRecoveryReq,
  ): Promise<TaskRecoveryRes> {
    return await this.goalClient.send<GoalTaskRecovery.Response, GoalTaskRecovery.Request>(
      GoalTaskRecovery.pattern,
      {
        data: {
          userId: uid,
          taskId,
          groupId: data?.groupId,
        },
      },
    );
  }

  @Delete('/:taskId/complete')
  @ApiOperation({ summary: 'Полное удаление дела' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    type: CompleteDeleteTaskRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(CompleteDeleteTaskRes)
  @HttpCode(HttpStatus.NO_CONTENT)
  async completeDeleteTask(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<CompleteDeleteTaskRes> {
    return await this.goalClient.send<
      GoalCompleteDeleteTask.Response,
      GoalCompleteDeleteTask.Request
    >(GoalCompleteDeleteTask.pattern, {
      data: {
        userId: uid,
        taskId,
      },
    });
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
