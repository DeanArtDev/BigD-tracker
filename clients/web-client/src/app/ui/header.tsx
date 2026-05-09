import Image from 'next/image';
import Link from 'next/link';
import { PropsWithChildren } from 'react';
import { Button, Separator } from '@/shared/ui-kit';
import { cn } from '@/shared/ui-kit/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui-kit/ui/avatar';

interface HeaderProps {
  readonly className?: string;
}

function Header({ className }: PropsWithChildren<HeaderProps>) {
  return (
    <header className={cn('flex items-center py-2 px-4 gap-4 min-h-[64px] border', className)}>
      <Link href="/">
        <Image className="border rounded" src="/big-d-logo.svg" width={38} height={38} alt="Logo" loading="eager" />
      </Link>

      <Separator orientation="vertical" />

      <Button variant="outline">Приложение</Button>

      <Avatar className="ml-auto">
        <AvatarImage src={undefined} alt={'Какое то имя'} />
        <AvatarFallback>UN</AvatarFallback>
      </Avatar>
    </header>
  );
}

export { Header, type HeaderProps };
