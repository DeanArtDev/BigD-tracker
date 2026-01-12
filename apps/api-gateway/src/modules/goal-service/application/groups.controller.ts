import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Groups')
@Controller('/groups')
export class GroupsController {
  constructor(private readonly goalClient: GoalServiceClientProxy) {}

  //
  // @Get('my')
  // @ApiOperation({ summary: 'Получение групп юзера' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: GetMyGroupsRes,
  // })
  // @ValidateRpcResponse(GetMyGroupsRes)
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // async getMyGoals(@TokenPayload() { uid }: AccessTokenPayload): Promise<GetMyGroupsRes> {
  //   return await this.goalClient.send<
  //     GoalGetGroupsByUserId.Response,
  //     GoalGetGroupsByUserId.Request
  //   >(GoalGetGroupsByUserId.pattern, { data: { userId: uid } });
  // }
  //
  // @Post()
  // @ApiOperation({ summary: 'Создание группы' })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   type: CreateGroupRes,
  // })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // @HttpCode(HttpStatus.CREATED)
  // @ValidateRpcResponse(CreateGroupRes)
  // async createGroup(
  //   @TokenPayload() { uid }: AccessTokenPayload,
  //   @Body() { data }: CreateGroupReq,
  // ): Promise<CreateGroupRes> {
  //   return this.createGroupSage.execute({
  //     userId: uid,
  //     name: data.name,
  //     description: data.description,
  //     goalId: data.goalId,
  //     things: data.things,
  //   });
  // }
  //
  // @Put(':groupId')
  // @ApiOperation({ summary: 'Обновление группы' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: UpdateGroupRes,
  // })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // @HttpCode(HttpStatus.OK)
  // @ValidateRpcResponse(UpdateGroupRes)
  // async updateGroup(
  //   @Param('groupId', ParseIntPipe) groupId: number,
  //   @TokenPayload() { uid }: AccessTokenPayload,
  //   @Body() { data }: UpdateGroupReq,
  // ): Promise<CreateGroupRes> {
  //   return await this.goalClient.send<GoalUpdateGroup.Response, GoalUpdateGroup.Request>(
  //     GoalUpdateGroup.pattern,
  //     {
  //       data: {
  //         id: groupId,
  //         userId: uid,
  //         name: data.name,
  //         goalId: data.goalId,
  //         description: data.description,
  //         things: data.things,
  //       },
  //     },
  //   );
  // }
  //
  // @Delete(':groupId')
  // @ApiOperation({ summary: 'Удаление группы' })
  // @ApiResponse({ status: HttpStatus.NO_CONTENT })
  // @ApiBearerAuth(ACCESS_TOKEN_KEY)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteGroup(
  //   @Param('groupId', ParseIntPipe) groupId: number,
  //   @TokenPayload() { uid }: AccessTokenPayload,
  // ): Promise<void> {
  //   await this.goalClient.send<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(
  //     GoalDeleteGroup.pattern,
  //     { data: { id: groupId, userId: uid } },
  //   );
  //   return;
  // }
}
