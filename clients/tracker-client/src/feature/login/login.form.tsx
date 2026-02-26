import { useLogin } from '@/entity/auth';
import { InputForm } from '@/shared/components/form';
import { routes } from '@/shared/lib/routes';
import { Button } from '@/shared/ui-kit/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui-kit/ui/card';
import { Form } from '@/shared/ui-kit/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { loginValidationSchema } from './login-validation';

interface LoginFormData {
  readonly email: string;
  readonly password: string;
}

function LoginForm() {
  const { login, isWrongPassOrLogin, isPending } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginValidationSchema),
    reValidateMode: 'onSubmit',
    disabled: isPending,
  });

  useEffect(() => {
    if (isWrongPassOrLogin) {
      toast.dismiss();
      toast.error('Не верный логин или пароль', { closeButton: true });
    }
  }, [isWrongPassOrLogin]);

  return (
    <Card className="w-[350px]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            login({
              body: {
                data: {
                  login: data.email,
                  password: data.password,
                },
              },
            });
          })}
          className="space-y-8 flex flex-col grow w-full"
        >
          <CardHeader>
            <CardTitle>Вход</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <InputForm name="email" label="Почта" placeholder="Почта сюда" />
            <InputForm name="password" label="Пароль" type="password" placeholder="Пароль тута" />
          </CardContent>

          <CardFooter className="flex flex-col">
            <Button type="submit" disabled={isPending}>
              Войти
            </Button>

            <p className="text-sm text-muted-foreground [&_a]:underline [&_a]:text-primary mt-4">
              <Link to={routes.signUp.path}>Создать аккаунт</Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export { LoginForm, type LoginFormData };
