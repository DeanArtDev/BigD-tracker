import { z } from 'zod';

const signUpValidationSchema = z
  .object({
    email: z.string({ error: 'Почта обязательна' }).email({ message: 'Не валидная почта' }),
    password: z
      .string({ error: 'Пароль обязателен' })
      .min(6, 'Пароль должен быть не меньше 6 символов'),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  });

export { signUpValidationSchema };
