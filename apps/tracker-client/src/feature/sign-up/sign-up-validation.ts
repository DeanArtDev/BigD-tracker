import { z } from 'zod';
import type { SignUpFormData } from './sign-up-form';

const signUpValidationSchema: z.Schema<SignUpFormData> = z
  .object({
    email: z
      .string({ required_error: 'Почта обязательна' })
      .email({ message: 'Не валидная почта' }),
    password: z
      .string({ required_error: 'Пароль обязателен' })
      .min(6, 'Пароль должен быть не меньше 6 символов'),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  });

export { signUpValidationSchema };
