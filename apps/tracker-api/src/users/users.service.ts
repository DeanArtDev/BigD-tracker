import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '@/users/users.repository';
import { User } from './users.entity';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { shapeUser } from '@/users/utils';

type FindUserData =
  | {
      id: number;
      email?: never;
      screenName?: never;
    }
  | {
      id?: never;
      email: string;
      screenName?: never;
    }
  | {
      id?: never;
      email?: never;
      screenName: string;
    };

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAll(): Promise<User[]> {
    const userList = await this.usersRepository.getAll();

    return userList.map<User>((rawUser) => mapAndValidateEntity(User, shapeUser(rawUser)));
  }

  async findUser(data: FindUserData): Promise<User> {
    if (data.email != null) {
      const rawUser = await this.usersRepository.findUserByEmail({ email: data.email });
      if (rawUser == null) throw new NotFoundException('User is not found');
      return mapAndValidateEntity(User, shapeUser(rawUser));
    }

    if (data.screenName != null) {
      const rawUser = await this.usersRepository.findUserByScreeName({
        screenName: data.screenName,
      });
      if (rawUser == null) throw new NotFoundException('User is not found');
      return mapAndValidateEntity(User, shapeUser(rawUser));
    }

    if (data.id != null) {
      const rawUser = await this.usersRepository.findUserById({ id: data.id });
      if (rawUser == null) throw new NotFoundException('User is not found');
      return mapAndValidateEntity(User, shapeUser(rawUser));
    }

    return undefined as never;
  }

  async createUser(data: { password: string; email: string }) {
    const existedUser = await this.usersRepository.findUserByEmail({ email: data.email });
    if (existedUser != null) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.hashPassword(data.password);
    const newUser = await this.usersRepository.create({
      passwordHash,
      email: data.email,
    });

    if (newUser == null) {
      throw new InternalServerErrorException(
        { email: data.email },
        { cause: 'User could not be created' },
      );
    }

    return newUser;
  }

  async checkUserByPassword(data: { email: string; password: string }): Promise<User | undefined> {
    const rawUser = await this.usersRepository.findUserByEmail({ email: data.email });
    if (rawUser == null) return undefined;
    if (await this.validatePassword(data.password, rawUser.password_hash)) {
      return mapAndValidateEntity(User, shapeUser(rawUser));
    }
    return undefined;
  }

  private async validatePassword(pass: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(pass, hash);
  }

  private async hashPassword(pass: string): Promise<string> {
    return await bcrypt.hash(pass, 10);
  }
}
