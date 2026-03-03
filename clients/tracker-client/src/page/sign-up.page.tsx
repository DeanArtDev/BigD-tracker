import { useReferralTokenValidate } from '@/entity/auth';
import { SignUpForm } from '@/feature/sign-up';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import { Typography } from '@/shared/components/typography';
import { useUrlQuery } from '@/shared/lib/react/use-url-query';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { z } from 'zod';

const signUpPageSchema = z.object({ token: z.jwt().optional() });

function SignUpPage() {
  const [pageQuery] = useUrlQuery(signUpPageSchema);
  const { isLoading, isError } = useReferralTokenValidate({ token: pageQuery?.token });

  if (pageQuery?.token == null) {
    return <AppEmptyPlaceholder message="Регистрация возможна только по реферальной ссылке" />;
  }

  return (
    <div className="flex grow h-lvh items-center justify-center">
      <DataLoader
        isLoading={isLoading}
        isError={isError}
        errorElement={
          <AppEmptyPlaceholder
            message="Ваш токен истек или не валидный"
            afterEndSlot={<Typography.Muted>Внимание! Токен действует в течение 1 часа!</Typography.Muted>}
          />
        }
      >
        <SignUpForm />
      </DataLoader>
    </div>
  );
}

export const Component = SignUpPage;
