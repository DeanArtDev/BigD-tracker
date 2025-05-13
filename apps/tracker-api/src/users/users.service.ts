import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcrypt';
import { UsersRepository } from '@/users/users.repository';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAll(): Promise<User[]> {
    const userList = await this.usersRepository.getAll();

    return userList.map<User>(({ id, email, name }) =>
      plainToInstance(User, { id, email, name }),
    );
  }

  async createUser({
    password,
    email,
  }: {
    password: string;
    email: string;
  }): Promise<User> {
    const passwordHash = await this.hashPassword(password);
    const newUser = await this.usersRepository.create({ passwordHash, email });
    return plainToInstance(User, newUser);
  }

  private async validatePassword(pass: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(pass, hash);
  }

  private async hashPassword(pass: string): Promise<string> {
    return await bcrypt.hash(pass, 10);
  }
}
