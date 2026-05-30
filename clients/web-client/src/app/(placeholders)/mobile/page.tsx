import Image from 'next/image';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui-kit';

export default function MobilePlaceholderPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="grow max-w-[326px]">
        <CardHeader className="flex flex-col items-center">
          <Image src="/big-d-logo.png" width={60} height={28} alt="Logo" loading="eager" />

          <CardTitle>Мобильная версия в разработке</CardTitle>

          <CardDescription className="text-center">
            Пока что интерфейс доступен только на десктопе. Мы скоро добавим мобильную версию.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
