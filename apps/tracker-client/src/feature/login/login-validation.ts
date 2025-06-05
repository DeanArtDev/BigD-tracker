import { z } from 'zod';
import type { LoginFormData } from './login.form';

const loginValidationSchema: z.Schema<LoginFormData> = z.object({
  email: z.string({ required_error: 'Почта обязательна' }).email({ message: 'Не валидная почта' }),
  password: z
    .string({ required_error: 'Пароль обязателен' })
    .min(6, 'Пароль должен быть не меньше 6 символов'),
});

export { loginValidationSchema };
