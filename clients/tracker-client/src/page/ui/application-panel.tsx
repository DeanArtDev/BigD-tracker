import type { PageApplicationRote } from '@/page/lib/types';
import { Card, CardContent } from '@/shared/ui-kit/ui/card';
import { Link } from 'react-router-dom';

interface ApplicationPanelProps {
  readonly routes: PageApplicationRote[];
}

function ApplicationPanel({ routes }: ApplicationPanelProps) {
  return (
    <ul className="gap-6 w-full grid grid-cols-[repeat(auto-fit,80px)] justify-center max-w-[600px]">
      {routes.map((route) => {
        if (route.internal) return null;
        return (
          <li key={route.title}>
            <Link to={route.to}>
              <Card className="h-[80px] flex justify-center items-center p-0!">
                <CardContent className="p-0">{route.icon?.({ size: 45 })}</CardContent>
              </Card>
            </Link>
            <h4 className="mt-2 text-xs font-semibold text-center">{route.title}</h4>
          </li>
        );
      })}
    </ul>
  );
}

export { ApplicationPanel, type ApplicationPanelProps };
