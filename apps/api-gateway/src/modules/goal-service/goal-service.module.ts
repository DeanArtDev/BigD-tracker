import { GroupsController } from './groups';
import { HttpStatus, Module } from '@nestjs/common';
import { BaseHttpException, ExceptionWrongRpcResponse } from '@shared/exceptions';
import { RpcResponseValidationModule } from '@shared/rpc-response-validation';
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
  controllers: [GroupsController, TasksController, TasksInboxController],
})
export class GoalServiceModule {}
