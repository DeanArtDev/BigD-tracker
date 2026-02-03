import { z } from 'zod';

const loginValidationSchema = z.object({
  email: z.string({ error: 'Почта обязательна' }).email({ message: 'Не валидная почта' }),
  password: z
    .string({ error: 'Пароль обязателен' })
    .min(6, 'Пароль должен быть не меньше 6 символов'),
});

export { loginValidationSchema };
