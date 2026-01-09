import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { UpdateThingRes } from '@/modules/goal-service/application/dtos';
import {
  GoalAssignTaskToGroup,
  GoalCloneTask,
  GoalCreateTask,
  GoalDeleteTask,
  GoalReplaceTask,
  GoalUpdateInboxTask,
} from '@big-d/api-contracts';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import { firstValueFrom } from 'rxjs';
import {
  AssignTaskToGroupRes,
  CloneTaskReq,
  CloneTaskRes,
  CreateTaskReq,
  CreateTaskRes,
  ReplaceTaskReq,
  ReplaceTaskRes,
  UpdateInboxTaskReq,
  UpdateInboxTaskRes,
} from './dtos';

@ApiTags('Tasks')
@Controller('/tasks')
export class TasksController {
  constructor(private readonly goalClient: GoalServiceClientProxy) {}

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
    return await firstValueFrom(
      this.goalClient.send<GoalCreateTask.Response, GoalCreateTask.Request>(
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
      ),
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
    return await firstValueFrom(
      this.goalClient.send<GoalCloneTask.Response, GoalCloneTask.Request>(GoalCloneTask.pattern, {
        data: {
          userId: uid,
          taskId,
          groupId: data?.groupId,
        },
      }),
    );
  }

  @Post('/:taskId/groups/:groupId')
  @ApiOperation({ summary: 'Добавление дела в группу' })
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
    return await firstValueFrom(
      this.goalClient.send<GoalAssignTaskToGroup.Response, GoalAssignTaskToGroup.Request>(
        GoalAssignTaskToGroup.pattern,
        {
          data: {
            userId: uid,
            taskId,
            groupId,
          },
        },
      ),
    );
  }

  @Put('/:taskId')
  @ApiOperation({ summary: 'Редактирование дела' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateThingRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(ReplaceTaskRes)
  async replaceTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: ReplaceTaskReq,
  ): Promise<ReplaceTaskRes> {
    return await firstValueFrom(
      this.goalClient.send<GoalReplaceTask.Response, GoalReplaceTask.Request>(
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
      ),
    );
  }

  @Put('/:taskId/inbox')
  @ApiOperation({ summary: 'Редактирование дела в IN BOX' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateThingRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(UpdateInboxTaskRes)
  async updateTaskInInbox(
    @Param('taskId', ParseIntPipe) taskId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: UpdateInboxTaskReq,
  ): Promise<UpdateInboxTaskRes> {
    return await firstValueFrom(
      this.goalClient.send<GoalUpdateInboxTask.Response, GoalUpdateInboxTask.Request>(
        GoalUpdateInboxTask.pattern,
        {
          data: {
            id: taskId,
            userId: uid,
            priority: data.priority,
            name: data.name,
            startDate: data.startDate,
            description: data.description,
            deadline: data.deadline,
          },
        },
      ),
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
    await firstValueFrom(
      this.goalClient.send<GoalDeleteTask.Response, GoalDeleteTask.Request>(
        GoalDeleteTask.pattern,
        { data: { id: taskId, userId: uid } },
      ),
    );
    return;
  }
}
