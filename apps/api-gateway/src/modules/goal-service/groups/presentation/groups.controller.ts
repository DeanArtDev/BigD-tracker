import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GoalCreateGroup, GoalGetGroupInBox } from '@big-d/api-contracts';
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import { CreateGroupReq, CreateGroupRes, GetInBoxRes } from './dtos';

@ApiTags('Groups')
@Controller('/groups')
export class GroupsController {
  constructor(private readonly goalClient: GoalServiceClientProxy) {}

  @Get('inbox')
  @ApiOperation({ summary: 'Получение группы IN BOX юзера с делами' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetInBoxRes,
  })
  @ValidateRpcResponse(GetInBoxRes)
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getUsersGoals(@TokenPayload() { uid }: AccessTokenPayload): Promise<GetInBoxRes> {
    return await this.goalClient.send<GoalGetGroupInBox.Response, GoalGetGroupInBox.Request>(
      GoalGetGroupInBox.pattern,
      { data: { userId: uid } },
    );
  }

  @Post()
  @ApiOperation({ summary: 'Создание группы' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateGroupRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.CREATED)
  @ValidateRpcResponse(CreateGroupRes)
  async createGroup(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: CreateGroupReq,
  ): Promise<CreateGroupRes> {
    return await this.goalClient.send<GoalCreateGroup.Response, GoalCreateGroup.Request>(
      GoalCreateGroup.pattern,
      { data: { userId: uid, description: data.description, name: data.name } },
    );
  }
}
