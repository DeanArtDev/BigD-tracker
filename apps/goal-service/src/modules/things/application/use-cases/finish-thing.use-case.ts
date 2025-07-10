import { THINGS_REPOSITORY, ThingsRepository } from '@/modules/things/application';
import { ThingEntity } from '@/modules/things/domain';
import { DateVo, Result } from '@big-d/api-utils';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

interface FinishThingInput {
  readonly id: number;
  readonly userId: number;
  readonly endDate: string;
  readonly result: number;
  readonly comment?: string;
}

@Injectable()
export class FinishThingUseCase {
  constructor(@Inject(THINGS_REPOSITORY) private readonly thingsRepo: ThingsRepository) {}
  async execute({ id, userId, result, comment, endDate }: FinishThingInput): Promise<ThingEntity> {
    const thing = await this.thingsRepo.findById({ id, userId });
    if (thing == null) {
      throw new NotFoundException(`Thing: ${id} is not existed`);
    }

    thing
      .finish({ endDate: DateVo.create(endDate), comment, result: Result.create(result) })
      .validate();

    const updated = await this.thingsRepo.update(thing);
    if (updated == null) {
      throw new InternalServerErrorException('Error occurred while finishing thing');
    }

    return updated;
  }
}
