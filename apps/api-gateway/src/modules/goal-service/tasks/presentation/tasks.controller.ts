import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GoalCreateTask } from '@big-d/api-contracts';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import { firstValueFrom } from 'rxjs';
import { CreateTaskReq, CreateTaskRes } from './dtos';

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
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(CreateTaskRes)
  async createThing(
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
          },
        },
      ),
    );
  }
}
