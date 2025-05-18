import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '@/users/users.repository';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAll(): Promise<User[]> {
    const userList = await this.usersRepository.getAll();

    return userList.map<User>(({ id, email, screen_name: name }) =>
      plainToInstance(User, { id, email, name }),
    );
  }

  async checkUser(data: {
    id?: number;
    email?: string;
    screenName?: string;
  }): Promise<boolean> {
    if (data.email != null) {
      return !!(await this.usersRepository.findUserByEmail({ email: data.email }));
    }

    if (data.screenName != null) {
      return !!(await this.usersRepository.findUserByScreeName({
        screenName: data.screenName,
      }));
    }

    if (data.id != null) {
      return !!(await this.usersRepository.findUserById({ id: data.id }));
    }

    return false;
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

  private async validatePassword(pass: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(pass, hash);
  }

  private async hashPassword(pass: string): Promise<string> {
    return await bcrypt.hash(pass, 10);
  }
}
