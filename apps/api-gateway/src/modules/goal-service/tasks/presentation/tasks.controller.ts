import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { UpdateThingRes } from '@/modules/goal-service/application/dtos';
import { GoalCreateTask, GoalReplaceTask, GoalUpdateInboxTask } from '@big-d/api-contracts';
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
import { firstValueFrom } from 'rxjs';
import {
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
  async replaceTaskInInbox(
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
}
