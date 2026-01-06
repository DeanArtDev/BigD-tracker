import { CreateGroupSage } from '@/modules/goal-service/application/sages';
import { HttpStatus, Module } from '@nestjs/common';
import { BaseHttpException, ExceptionWrongRpcResponse } from '@shared/exceptions';
import { RpcResponseValidationModule } from '@shared/rpc-response-validation';
import { GoalsController } from './application/goals.controller';
import { GroupsController } from './application/groups.controller';
import { ThingsController } from './application/things.controller';
import { TasksController, TasksInboxController } from './tasks';

@Module({
  imports: [
    RpcResponseValidationModule.forFeature({
      useValue: ({ issues }) =>
        BaseHttpException.createFromBase(
          new ExceptionWrongRpcResponse({ issues }),
          HttpStatus.BAD_GATEWAY,
        ),
    }),
  ],
  controllers: [
    GoalsController,
    GroupsController,
    ThingsController,
    TasksController,
    TasksInboxController,
  ],
  providers: [CreateGroupSage],
})
export class GoalServiceModule {}
