import { useReferralToken } from '@/entity/auth';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { ButtonLoading } from '@/shared/components/button-loading';
import { Typography } from '@/shared/components/typography';
import { routes } from '@/shared/lib/routes';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { Button } from '@/shared/ui-kit/ui/button';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui-kit/ui/tabs';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

function SettingsPage() {
  const isMobile = useIsMobile();

  const { data, generateReferralToken, isPending, isSuccess } = useReferralToken();

  return (
    <PageWrapper fixContainer className="pt-2 lg:pt-4 px-2 md:px-4 lg:px-4 border-l border-r" title="Настройки">
      <Typography.H2 className="text-center lg:mb-4">Настройки</Typography.H2>
      <Separator className="mb-2" />

      <div className="flex flex-col gap-2 grow">
        <Tabs defaultValue="security">
          <TabsList className="mx-auto mb-3">
            <TabsTrigger value="security">Безопасность</TabsTrigger>
          </TabsList>

          <TabsContent className="flex flex-col" value="security">
            <Typography.H4 className="mb-3">Реферальная ссылка</Typography.H4>

            {!isSuccess ? (
              <ButtonLoading
                className="w-fit"
                variant="default"
                isLoading={isPending}
                onClick={() => void generateReferralToken(undefined)}
              >
                Сгенерировать
              </ButtonLoading>
            ) : (
              <Button
                className="w-fit"
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(getLink(data.data.token));
                  toast.success('Скопировано', {
                    position: isMobile ? 'bottom-center' : 'top-center',
                    duration: 1000,
                  });
                }}
              >
                Скопировать ссылку
                <Copy />
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}

function getLink(token: string): string {
  return `${window.location.origin}${routes.signUp.path}?token=${token}`;
}

export const Component = SettingsPage;
