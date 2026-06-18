'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { ButtonLoading, Typography } from '@/shared/ui-kit';
import { InputForm, InputPasswordForm } from '@/shared/ui-kit/form';

const validationSchema = z.object({
  email: z.string({ error: 'Почта обязательна' }).email({ message: 'Не валидная почта' }),
  password: z.string({ error: 'Пароль обязателен' }).min(6, 'Пароль должен быть не меньше 6 символов'),
});

type LoginFormData = z.input<typeof validationSchema>;
type LoginSubmitData = z.output<typeof validationSchema>;

interface LoginFormProps {
  readonly disabledFields?: boolean;
  readonly loadingButton?: boolean;
  readonly onSubmit: (data: LoginFormData) => void;
}

function LoginForm(props: LoginFormProps) {
  const { onSubmit, loadingButton = false, disabledFields } = props;

  const form = useForm<LoginFormData, never, LoginSubmitData>({
    resolver: standardSchemaResolver(validationSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    disabled: disabledFields,
    values: {
      email: '',
      password: '',
    },
  });

  return (
    <FormProvider {...form}>
      <form
        noValidate
        className="flex flex-col w-[440px] bg-background rounded-xl p-6 gap-4 border shadow-lg"
        onSubmit={form.handleSubmit((formData) => void onSubmit(formData))}
      >
        <div className="flex flex-col">
          <Typography.H3 className="text-left">С возвращением</Typography.H3>
          <Typography.Muted>Войди, что бы продолжить</Typography.Muted>
        </div>

        <InputForm name="email" label="Email" placeholder="m@example.com" />

        <InputPasswordForm name="password" label="Пароль" placeholder="*********" />

        <ButtonLoading className="mt-6" size="lg" type="submit" loading={loadingButton}>
          Войти
        </ButtonLoading>
      </form>
    </FormProvider>
  );
}

export { LoginForm, type LoginFormProps };
