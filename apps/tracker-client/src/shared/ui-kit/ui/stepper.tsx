import { cn } from '@/shared/ui-kit/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  readonly className?: string;
  readonly steps: { label: string }[];
  readonly current: number;
}

function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ul className={cn(className, 'flex items-center min-h-[20px] w-full')}>
      {steps.map((_, index) => {
        const isDone = current > index + 1;
        const isCurrent = index + 1 === current;
        const isLast = index === steps.length - 1;

        return (
          <li key={index} className={cn('flex items-center', { 'w-full': !isLast })}>
            <div className="flex items-center justify-center min-h-[20px] min-w-[20px]">
              {isDone ? (
                <Check color="var(--color-primary)" size={20} />
              ) : (
                <div
                  className={cn(
                    'w-3 h-3 rounded-full transition-colors duration-300',
                    isCurrent ? 'bg-primary' : 'bg-gray-300',
                  )}
                />
              )}
            </div>

            {!isLast && (
              <div className="flex-1 rounded-xl overflow-hidden h-[4px] mx-1.5 shadow bg-gray-300">
                <div
                  className={cn(
                    'h-full transition-width duration-500 ease-out',
                    isDone ? 'bg-primary w-full' : isCurrent ? 'bg-primary w-0' : 'w-0',
                  )}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export { Stepper, type StepperProps };
