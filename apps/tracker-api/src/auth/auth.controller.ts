import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest, RegisterResponse } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  /* TODO:
   *   [x] короткий токен отдаем на клиент в ответе
   *   [x] соль пока хранится в переменной окружения
   *   [] рефреш отдаем в cookie
   *   [] рефреш токен по юзер-агенту храним в базе
   * */
  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: RegisterResponse,
  })
  async register(@Body() body: RegisterRequest): Promise<RegisterResponse> {
    const { token } = await this.authService.register(body);
    return { data: { token } };
  }
}
