import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GOAL_SERVICE_RMQ_KEY, GoalFinishThing } from '@big-d/api-contracts';
import { ValidateRpcResponse } from '@big-d/api-utils';
import {
  Body,
  Controller,
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
import { FinishThingReq, FinishThingRes } from './dtos';

@ApiTags('Things')
@Controller('/things')
export class ThingsController {
  constructor(@Inject(GOAL_SERVICE_RMQ_KEY) private readonly goalClient: ClientProxy) {}

  @Post('/:thingId')
  @ApiOperation({ summary: 'Завершение дела' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FinishThingRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(FinishThingRes)
  async createGroup(
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
}
