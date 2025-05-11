import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UsersRepository } from '@/users/users.repository';
import { User } from './users.entity';
import { CreateUserDto } from './schemas/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAll(): Promise<User[]> {
    const userList = await this.usersRepository.getAll();

    return userList.map<User>(({ id, email, name }) =>
      plainToInstance(User, { id, email, name }),
    );
  }

  async createUser({ name, email }: CreateUserDto): Promise<User> {
    const newUser = await this.usersRepository.create({ name, email });
    return plainToInstance(User, newUser);
  }
}
