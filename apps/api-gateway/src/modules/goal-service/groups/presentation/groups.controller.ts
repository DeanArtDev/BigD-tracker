import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GoalGetGroupInBox } from '@big-d/api-contracts';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import { GetInBoxRes } from './dtos';

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
}
