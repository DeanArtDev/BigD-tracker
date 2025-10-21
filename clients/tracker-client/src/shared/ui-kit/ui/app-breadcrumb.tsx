import type { ReactNode } from 'react';
import { Link, type To } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb';

interface AppBreadcrumbProps {
  readonly items: (
    | {
        readonly to: string | To;
        readonly children: ReactNode;
        readonly className?: string;
      }
    | {
        readonly to?: never;
        readonly title: 'separator';
        readonly children?: ReactNode;
        readonly className?: string;
      }
  )[];
}

function AppBreadcrumb({ items }: AppBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items
          .filter((item, index) => {
            return !('title' in item && item.title === 'separator' && items.length - 1 === index);
          })
          .map((item, index, array) => {
            if (item.to != null) {
              const isCurrentPage = index === array.length - 1;

              return (
                <BreadcrumbItem key={item.to.toString()}>
                  <BreadcrumbLink asChild>
                    {isCurrentPage ? (
                      <BreadcrumbPage>{item.children}</BreadcrumbPage>
                    ) : (
                      <Link to={item.to}>{item.children}</Link>
                    )}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              );
            }

            const { title, ...separatorProps } = item;
            if (title === 'separator') {
              return <BreadcrumbSeparator key={index} {...separatorProps} />;
            }

            return null;
          })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export { AppBreadcrumb, type AppBreadcrumbProps };
