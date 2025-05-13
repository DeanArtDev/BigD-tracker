import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterRequest } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async register(data: RegisterRequest): Promise<{ token: string }> {
    const newUser = await this.userService.createUser({
      email: data.login,
      password: data.password,
    });

    const token = await this.jwtService.signAsync({ id: newUser.id });

    return {
      token,
    };
  }
}
