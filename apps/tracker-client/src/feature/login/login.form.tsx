import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui-kit/ui/card';
import { Button } from '@/shared/ui-kit/ui/button';
import { Link } from 'react-router-dom';
import { routes } from '@/shared/lib/routes';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui-kit/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/shared/ui-kit/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/entity/auth';
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

  return (
    <Card className="w-[350px]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            login({
              body: {
                login: data.email,
                password: data.password,
              },
            });
          })}
          className="space-y-8"
        >
          <CardHeader>
            <CardTitle>Вход</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Почта</FormLabel>
                  <FormControl>
                    <Input placeholder="Почта сюда" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input placeholder="Пароль тута" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col">
            {isWrongPassOrLogin && (
              <small className="text-destructive mb-6 text-sm font-medium leading-none">
                Не верный логин или пароль
              </small>
            )}

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
