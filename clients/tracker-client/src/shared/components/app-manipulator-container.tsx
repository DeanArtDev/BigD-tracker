import { cn } from '@/shared/ui-kit/utils';
import { type ReactNode } from 'react';

interface AppManipulatorContainerProps {
  readonly items: { element: ReactNode; className?: string; key: string }[];
}

function AppManipulatorContainer({ items }: AppManipulatorContainerProps) {
  return (
    <div
      className={cn(
        'tasks-page-manipulator relative z-10',
        'fixed bottom-4 md:bottom-8 inset-x-0 mx-auto',
        'w-fit',
        'bg-secondary border-2 rounded-2xl shadow-lg',
      )}
    >
      <ul className={cn('flex flex-nowrap gap-2 p-1.5 relative')}>
        {items.map((item) => {
          return (
            <li key={item.key} className={item.className}>
              {item.element}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { AppManipulatorContainer, type AppManipulatorContainerProps };
