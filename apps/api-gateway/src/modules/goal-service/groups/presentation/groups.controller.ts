import { AppRmqClient } from '@/infrastructure/rmq-clients';
import { GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients/clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import {
  GoalCreateGroup,
  GoalDeleteGroup,
  GoalGetAssignableGroups,
  GoalGetGroup,
  GoalGetGroupInBox,
  GoalReplaceGroup,
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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import {
  CreateGroupReq,
  CreateGroupRes,
  DeleteGroupRes,
  GetAssignableGroupsRes,
  GetInBoxRes,
  GroupResSingle,
  ReplaceGroupReq,
  ReplaceGroupRes,
} from './dtos';

@ApiTags('Groups')
@Controller('/groups')
export class GroupsController {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Get('inbox')
  @ApiOperation({ summary: 'Получение группы IN BOX с делами' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetInBoxRes,
  })
  @ValidateRpcResponse(GetInBoxRes)
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getInbox(@TokenPayload() { uid }: AccessTokenPayload): Promise<GetInBoxRes> {
    return await this.goalClient.send<GoalGetGroupInBox.Response, GoalGetGroupInBox.Request>(
      GoalGetGroupInBox.pattern,
      { data: { userId: uid } },
    );
  }

  @Get('/assignable')
  @ApiOperation({ summary: 'Группы доступные к назначению дел' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAssignableGroupsRes,
  })
  @ValidateRpcResponse(GetAssignableGroupsRes)
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getAssignableGroups(@TokenPayload() { uid }: AccessTokenPayload): Promise<GetAssignableGroupsRes> {
    return await this.goalClient.send<GoalGetAssignableGroups.Response, GoalGetAssignableGroups.Request>(
      GoalGetAssignableGroups.pattern,
      { data: { userId: uid } },
    );
  }

  @Get('/:groupId')
  @ApiOperation({ summary: 'Получение группы' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GroupResSingle,
  })
  @ValidateRpcResponse(GroupResSingle)
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getGroup(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<GroupResSingle> {
    return await this.goalClient.send<GoalGetGroup.Response, GoalGetGroup.Request>(GoalGetGroup.pattern, {
      data: { userId: uid, groupId },
    });
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
    return await this.goalClient.send<GoalCreateGroup.Response, GoalCreateGroup.Request>(GoalCreateGroup.pattern, {
      data: { userId: uid, description: data.description, name: data.name },
    });
  }

  @Put('/:groupId')
  @ApiOperation({ summary: 'Редактирование группы' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ReplaceGroupRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(ReplaceGroupRes)
  async replaceGroup(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() { data }: ReplaceGroupReq,
  ): Promise<ReplaceGroupRes> {
    return await this.goalClient.send<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(GoalReplaceGroup.pattern, {
      data: {
        id: groupId,
        userId: uid,
        description: data.description,
        name: data.name,
        tasks: data.tasks,
      },
    });
  }

  @Delete('/:groupId')
  @ApiOperation({ summary: 'Удаление группы' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    type: DeleteGroupRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(DeleteGroupRes)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroup(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<DeleteGroupRes> {
    return await this.goalClient.send<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(GoalDeleteGroup.pattern, {
      data: {
        groupId,
        userId: uid,
      },
    });
  }
}
