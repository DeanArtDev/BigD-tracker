import { CreateGroupRes } from '@/modules/goal-service/application/dtos';
import { GOAL_SERVICE_RMQ_KEY, GoalCreateGroup, GoalGetGroupById } from '@big-d/api-contracts';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface CreateGroupSageInput {
  name: string;
  userId: number;
  goalId: number;
  description?: string;
  things: {
    name: string;
    description?: string;
    priority?: number;
    startDate?: string;
    deadline?: string;
  }[];
}

@Injectable()
export class CreateGroupSage {
  constructor(@Inject(GOAL_SERVICE_RMQ_KEY) private readonly goalClient: ClientProxy) {}

  async execute(input: CreateGroupSageInput): Promise<CreateGroupRes> {
    const { userId, things, goalId, description, name } = input;

    const existedGoal = await firstValueFrom(
      this.goalClient.send<GoalGetGroupById.Response, GoalGetGroupById.Request>(
        GoalGetGroupById.pattern,
        { data: { id: goalId, userId } },
      ),
    );
    if (existedGoal == null) {
      throw new NotFoundException(`Goal: ${goalId} is not found`);
    }

    return await firstValueFrom(
      this.goalClient.send<GoalCreateGroup.Response, GoalCreateGroup.Request>(
        GoalCreateGroup.pattern,
        { data: { name, description, userId, goalId, things } },
      ),
    );
  }
}
