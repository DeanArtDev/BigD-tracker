import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GetInBoxRes } from '@/modules/goal-service/application/dtos/groups/get-in-box.dto';
import { CreateGroupSage } from '@/modules/goal-service/application/sages';
import {
  GOAL_SERVICE_RMQ_KEY,
  GoalDeleteGroup,
  GoalGetGroupInBox,
  GoalUpdateGroup,
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
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CreateGroupReq, CreateGroupRes, UpdateGroupReq, UpdateGroupRes } from './dtos';

@ApiTags('Groups')
@Controller('/groups')
export class GroupsController {
  constructor(
    @Inject(GOAL_SERVICE_RMQ_KEY) private readonly goalClient: ClientProxy,
    private readonly createGroupSage: CreateGroupSage,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Получение  IN BOX юзера' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetInBoxRes,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async getUsersGoals(@TokenPayload() { uid }: AccessTokenPayload): Promise<GetInBoxRes> {
    return await firstValueFrom(
      this.goalClient.send<GoalGetGroupInBox.Response, GoalGetGroupInBox.Request>(
        GoalGetGroupInBox.pattern,
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
