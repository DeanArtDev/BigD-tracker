import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import {
  GOAL_SERVICE_RMQ_KEY,
  GoalCreateThing,
  GoalCreateThingIntoInBoxGroup,
  GoalDeleteThing,
  GoalFinishThing,
  GoalUpdateThing,
} from '@big-d/api-contracts';
import { ValidateRpcResponse } from '@big-d/api-utils';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import {
  CreateThingIntoInboxReq,
  CreateThingIntoInboxRes,
  CreateThingReq,
  CreateThingRes,
  FinishThingReq,
  FinishThingRes,
  UpdateThingReq,
  UpdateThingRes,
} from './dtos';

@ApiTags('Things')
@Controller('/things')
export class ThingsController {
  constructor(@Inject(GOAL_SERVICE_RMQ_KEY) private readonly goalClient: ClientProxy) {}

  @Post('/inbox')
  @ApiOperation({ summary: 'Создание дела в IN BOX' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CreateThingIntoInboxRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(CreateThingIntoInboxRes)
  async createIntoInbox(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateThingIntoInboxReq,
  ): Promise<CreateThingIntoInboxRes> {
    return await firstValueFrom(
      this.goalClient.send<
        GoalCreateThingIntoInBoxGroup.Response,
        GoalCreateThingIntoInBoxGroup.Request
      >(GoalCreateThingIntoInBoxGroup.pattern, {
        data: {
          userId: uid,
          priority: data.priority,
          description: data.description,
          name: data.name,
          startDate: data.startDate,
          deadline: data.deadline,
        },
      }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Создание дела' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CreateThingRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(CreateThingRes)
  async createThing(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateThingReq,
  ): Promise<CreateThingRes> {
    return await firstValueFrom(
      this.goalClient.send<GoalCreateThing.Response, GoalCreateThing.Request>(
        GoalCreateThing.pattern,
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

  @Post('/:thingId')
  @ApiOperation({ summary: 'Обновление дела' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateThingRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(UpdateThingRes)
  async updateThing(
    @Param('thingId', ParseIntPipe) thingId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: UpdateThingReq,
  ): Promise<UpdateThingRes> {
    return await firstValueFrom(
      this.goalClient.send<GoalUpdateThing.Response, GoalUpdateThing.Request>(
        GoalUpdateThing.pattern,
        {
          data: {
            id: thingId,
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

  @Post('/:thingId/finish')
  @ApiOperation({ summary: 'Завершение дела' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FinishThingRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(FinishThingRes)
  async finishThing(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('thingId', ParseIntPipe) thingId: number,
    @Body() { data }: FinishThingReq,
  ): Promise<FinishThingRes> {
    return await firstValueFrom(
      this.goalClient.send<GoalFinishThing.Response, GoalFinishThing.Request>(
        GoalFinishThing.pattern,
        {
          data: {
            id: thingId,
            userId: uid,
            endDate: data.endDate,
            result: data.result,
            comment: data.comment,
          },
        },
      ),
    );
  }

  @Delete(':thingId')
  @ApiOperation({ summary: 'Удаление дела' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroup(
    @Param('thingId', ParseIntPipe) thingId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<void> {
    await firstValueFrom(
      this.goalClient.send<GoalDeleteThing.Response, GoalDeleteThing.Request>(
        GoalDeleteThing.pattern,
        { data: { id: thingId, userId: uid } },
      ),
    );
    return;
  }
}
