import { cn } from '@/shared/ui-kit/utils';
import { type ReactNode, useEffect, useRef, useState } from 'react';

interface AppManipulatorContainerProps {
  readonly items: ({ element: ReactNode; className?: string; key: string } | null)[];
}

function AppManipulatorContainer({ items }: AppManipulatorContainerProps) {
  const innerRef = useRef<HTMLUListElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const update = () => setWidth(Math.ceil(el.clientWidth));
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      style={width == null ? undefined : { width }}
      className={cn(
        'tasks-page-manipulator relative z-10',
        'box-content max-w-full',
        'inline-block overflow-hidden transition-[width] duration-300 ease-out',
        'fixed bottom-4 md:bottom-8 inset-x-0 mx-auto',
        'bg-secondary border-2 rounded-2xl shadow-lg',
      )}
    >
      <ul className={cn('w-fit flex flex-nowrap gap-2 p-1.5')} ref={innerRef}>
        {items.map((item) => {
          if (item == null) return null;
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
