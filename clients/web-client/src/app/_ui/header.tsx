import Image from 'next/image';
import Link from 'next/link';
import { PropsWithChildren, ReactNode } from 'react';
import { Separator } from '@/shared/ui-kit';
import { cn } from '@/shared/ui-kit/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui-kit/ui/avatar';

interface HeaderProps {
  readonly className?: string;
  readonly content?: ReactNode;
}

function Header({ className, content }: PropsWithChildren<HeaderProps>) {
  return (
    <header className={cn('flex items-center py-2 px-4 gap-4 border @container/header', className)}>
      <Link href="/">
        <Image className="border rounded" src="/big-d-logo.svg" width={38} height={38} alt="Logo" loading="eager" />
      </Link>

      <Separator orientation="vertical" />

      {content}

      <Avatar className="ml-auto">
        <AvatarImage src={undefined} alt={'Какое то имя'} />
        <AvatarFallback>UN</AvatarFallback>
      </Avatar>
    </header>
  );
}

export { Header, type HeaderProps };
