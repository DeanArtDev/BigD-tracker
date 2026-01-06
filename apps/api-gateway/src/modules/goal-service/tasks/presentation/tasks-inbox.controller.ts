import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GoalCreateTaskInInbox } from '@big-d/api-contracts';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import { firstValueFrom } from 'rxjs';
import { CreateTaskInINBOXReq, CreateTaskInINBOXRes, CreateTaskRes } from './dtos';

@ApiTags('Tasks IN BOX')
@Controller('/tasks-in-box')
export class TasksInboxController {
  constructor(private readonly goalClient: GoalServiceClientProxy) {}

  @Post()
  @ApiOperation({ summary: 'Создание дела в IN BOX' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CreateTaskRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.CREATED)
  @ValidateRpcResponse(CreateTaskRes)
  async createTaskIntoInbox(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateTaskInINBOXReq,
  ): Promise<CreateTaskInINBOXRes> {
    return await firstValueFrom(
      this.goalClient.send<GoalCreateTaskInInbox.Response, GoalCreateTaskInInbox.Request>(
        GoalCreateTaskInInbox.pattern,
        {
          data: {
            userId: uid,
            priority: data.priority,
            description: data.description,
            name: data.name,
            startDate: data.startDate,
            deadline: data.deadline,
          },
        },
      ),
    );
  }
}
