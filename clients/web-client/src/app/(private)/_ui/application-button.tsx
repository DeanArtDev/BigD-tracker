import { Notebook } from 'lucide-react';
import Link from 'next/link';
import { RoutePaths } from '@/shared/routes';
import { Button, Typography } from '@/shared/ui-kit';

interface ApplicationButtonProps {
  readonly name: string;
  readonly route: RoutePaths;
}

function ApplicationButton({ route, name }: ApplicationButtonProps) {
  return (
    <>
      <Button variant="outline" asChild className="cursor-pointer">
        <Link
          href={route}
          className="bg-linear-to-b from-gray-50 to-primary/15 border-2 rounded-xl border-primary/40 w-[90px] h-[90px] hover:shadow cursor-pointer"
        >
          <Notebook className="stroke-primary size-10" />
        </Link>
      </Button>

      <Typography.H5>{name}</Typography.H5>
    </>
  );
}

export { ApplicationButton, type ApplicationButtonProps };
