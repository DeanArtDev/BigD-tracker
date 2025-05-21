import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui-kit/ui/card';
import { Button } from '@/shared/ui-kit/ui/button';
import { Link, useNavigate } from 'react-router-dom';
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
import { signUpValidationSchema } from './sign-up-validation';
import { useSignUp } from '@/entity/auth';

interface SignUpFormData {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword?: string;
}

function SignUpForm() {
  const navigate = useNavigate();
  const { signUp, isPending } = useSignUp();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpValidationSchema),
    reValidateMode: 'onSubmit',
    disabled: isPending,
  });

  const onSubmit = (data: SignUpFormData) => {
    signUp(
      {
        body: {
          login: data.email,
          password: data.password,
        },
      },
      {
        onSuccess: () => {
          navigate(routes.home.path);
        },
      },
    );
  };

  return (
    <Card className="w-[350px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardHeader>
            <CardTitle>Регистрация</CardTitle>
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

            <FormField
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Повторите пароль</FormLabel>
                  <FormControl>
                    <Input placeholder="Повторить бы" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col">
            <Button type="submit" disabled={isPending}>
              Зарегистрироваться
            </Button>

            <p className="text-sm text-muted-foreground [&_a]:underline [&_a]:text-primary mt-4">
              <Link to={isPending ? '' : routes.login.path}>Уже есть аккаунт?</Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export { SignUpForm, type SignUpFormData };
