import type { PageApplicationRote } from '@/page/lib/types';
import { Card, CardContent } from '@/shared/ui-kit/ui/card';
import { Link } from 'react-router-dom';

interface ApplicationPanelProps {
  readonly routes: PageApplicationRote[];
}

function ApplicationPanel({ routes }: ApplicationPanelProps) {
  return (
    <ul className="gap-x-6 gap-y-12 w-full grid auto-rows-[80px] grid-cols-[repeat(auto-fill,80px)] justify-center max-w-[600px]">
      {routes.map((route) => {
        return (
          <li key={route.title}>
            <Link to={route.to}>
              <Card className="w-full h-full flex justify-center items-center p-0!">
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
