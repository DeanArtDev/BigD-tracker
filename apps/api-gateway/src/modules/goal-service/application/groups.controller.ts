import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GetInBoxRes } from '@/modules/goal-service/application/dtos/groups/get-in-box.dto';
import { GetMyGroupsRes } from '@/modules/goal-service/application/dtos/groups/get-my-groups.dto';
import { CreateGroupSage } from '@/modules/goal-service/application/sages';
import {
  GoalDeleteGroup,
  GoalGetGroupInBox,
  GoalGetGroupsByUserId,
  GoalUpdateGroup,
} from '@big-d/api-contracts';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CreateGroupReq, CreateGroupRes, UpdateGroupReq, UpdateGroupRes } from './dtos';

@ApiTags('Groups')
@Controller('/groups')
export class GroupsController {
  constructor(
    private readonly goalClient: GoalServiceClientProxy,
    private readonly createGroupSage: CreateGroupSage,
  ) {}

  @Get('inbox')
  @ApiOperation({ summary: 'Получение группы IN BOX юзера с делами' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetInBoxRes,
  })
  @ValidateRpcResponse(GetInBoxRes)
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getUsersGoals(@TokenPayload() { uid }: AccessTokenPayload): Promise<GetInBoxRes> {
    return await firstValueFrom(
      this.goalClient.send<GoalGetGroupInBox.Response, GoalGetGroupInBox.Request>(
        GoalGetGroupInBox.pattern,
        { data: { userId: uid } },
      ),
    );
  }

  @Get('my')
  @ApiOperation({ summary: 'Получение групп юзера' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetMyGroupsRes,
  })
  @ValidateRpcResponse(GetMyGroupsRes)
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getMyGoals(@TokenPayload() { uid }: AccessTokenPayload): Promise<GetMyGroupsRes> {
    return await firstValueFrom(
      this.goalClient.send<GoalGetGroupsByUserId.Response, GoalGetGroupsByUserId.Request>(
        GoalGetGroupsByUserId.pattern,
        { data: { userId: uid } },
      ),
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
    return this.createGroupSage.execute({
      userId: uid,
      name: data.name,
      description: data.description,
      goalId: data.goalId,
      things: data.things,
    });
  }

  @Put(':groupId')
  @ApiOperation({ summary: 'Обновление группы' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateGroupRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ValidateRpcResponse(UpdateGroupRes)
  async updateGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
    @Body() { data }: UpdateGroupReq,
  ): Promise<CreateGroupRes> {
    return await firstValueFrom(
      this.goalClient.send<GoalUpdateGroup.Response, GoalUpdateGroup.Request>(
        GoalUpdateGroup.pattern,
        {
          data: {
            id: groupId,
            userId: uid,
            name: data.name,
            goalId: data.goalId,
            description: data.description,
            things: data.things,
          },
        },
      ),
    );
  }

  @Delete(':groupId')
  @ApiOperation({ summary: 'Удаление группы' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<void> {
    await firstValueFrom(
      this.goalClient.send<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(
        GoalDeleteGroup.pattern,
        { data: { id: groupId, userId: uid } },
      ),
    );
    return;
  }
}
