import { Inject, Injectable } from '@nestjs/common';
import { UserView } from '../dto';
import { ExceptionUserNotFound } from '../exceptions';
import { AuthTransaction, UserReadRepository, USERS_READ_REPOSITORY } from '../ports';
import { UserById, usersCombinators } from '../specifications';

const { and } = usersCombinators;

@Injectable()
class UserCheckerService {
  constructor(@Inject(USERS_READ_REPOSITORY) private readonly userReadRepo: UserReadRepository) {}

  async ensureUserExists(
    input: { userId: number },
    params?: { trx?: AuthTransaction; skipException?: false | undefined },
  ): Promise<UserView>;
  async ensureUserExists(
    input: { userId: number },
    params: { trx?: AuthTransaction; skipException: true },
  ): Promise<UserView | null>;
  async ensureUserExists(
    input: { userId: number },
    params?: { trx?: AuthTransaction; skipException?: boolean },
  ): Promise<UserView | null> {
    const { skipException, trx } = params ?? {};

    const user = await this.userReadRepo.getOneUser(and(UserById(input.userId)), trx);

    if (skipException != null) {
      return user;
    }

    if (user == null) {
      throw new ExceptionUserNotFound({ userId: input.userId });
    }

    return user;
  }
}

export { UserCheckerService };
