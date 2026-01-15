import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import {
  GoalAssignTaskToInbox,
  GoalCreateTaskInInbox,
  GoalUpdateInboxTask,
} from '@big-d/api-contracts';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import {
  AssignTaskToInboxRes,
  CreateTaskInINBOXReq,
  CreateTaskInINBOXRes,
  CreateTaskRes,
  UpdateInboxTaskReq,
  UpdateInboxTaskRes,
} from './dtos';

@ApiTags('Tasks Inbox manipulation')
@Controller('tasks')
export class TasksInboxController {
  constructor(private readonly goalClient: GoalServiceClientProxy) {}

  @Post('/in-box')
  @ApiOperation({ summary: 'Создание дела в IN BOX' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateTaskRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.CREATED)
  @ValidateRpcResponse(CreateTaskRes)
  async createTaskIntoInbox(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTaskInINBOXReq,
  ): Promise<CreateTaskInINBOXRes> {
    return await this.goalClient.send<
      GoalCreateTaskInInbox.Response,
      GoalCreateTaskInInbox.Request
    >(GoalCreateTaskInInbox.pattern, {
      data: {
        userId: uid,
        priority: data.priority,
        description: data.description,
        name: data.name,
        deadline: data.deadline,
      },
    });
  }

  @Post('/:taskId/in-box/assign')
  @ApiOperation({ summary: 'Перемещение дела в IN BOX' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AssignTaskToInboxRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(AssignTaskToInboxRes)
  async assignTaskToInbox(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<AssignTaskToInboxRes> {
    return await this.goalClient.send<
      GoalAssignTaskToInbox.Response,
      GoalAssignTaskToInbox.Request
    >(GoalAssignTaskToInbox.pattern, {
      data: {
        userId: uid,
        taskId,
      },
    });
  }

  @Put('/:taskId/inbox')
  @ApiOperation({ summary: 'Редактирование дела в IN BOX' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateInboxTaskRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(UpdateInboxTaskRes)
  async updateTaskInInbox(
    @Param('taskId', ParseIntPipe) taskId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: UpdateInboxTaskReq,
  ): Promise<UpdateInboxTaskRes> {
    return await this.goalClient.send<GoalUpdateInboxTask.Response, GoalUpdateInboxTask.Request>(
      GoalUpdateInboxTask.pattern,
      {
        data: {
          id: taskId,
          userId: uid,
          priority: data.priority,
          name: data.name,
          description: data.description,
          deadline: data.deadline,
        },
      },
    );
  }
}
