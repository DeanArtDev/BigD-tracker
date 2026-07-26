import { Notebook } from 'lucide-react';
import { AppLink } from '@/shared/project-ui';
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
        <AppLink
          href={route}
          className="bg-linear-to-b from-gray-50 to-primary/15 border-2 rounded-xl border-primary/40 w-[90px] h-[90px] hover:shadow cursor-pointer"
        >
          <Notebook className="stroke-primary size-10" />
        </AppLink>
      </Button>

      <Typography.H5>{name}</Typography.H5>
    </>
  );
}

export { ApplicationButton, type ApplicationButtonProps };
