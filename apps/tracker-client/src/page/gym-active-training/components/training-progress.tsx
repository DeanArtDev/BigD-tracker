import { Stepper } from '@/shared/ui-kit/ui/stepper';
import { cn } from '@/shared/ui-kit/utils';
import { format } from 'date-fns';
import { isFunction } from 'lodash-es';
import { Check, Clock4, MoveLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ActiveExercise, ActiveRepetition } from '../model/active-training-controller';

interface TrainingProgressProps {
  readonly trainingName: string;
  readonly exerciseList: ActiveExercise[];
  readonly repetitionList: ActiveRepetition[];
  readonly appendSlot?: (() => ReactNode) | ReactNode;
}

function TrainingProgress({
  repetitionList,
  exerciseList,
  trainingName,
  appendSlot,
}: TrainingProgressProps) {
  const activeExercise = exerciseList.find((i) => i.stage === 'active');

  if (activeExercise == null) {
    return <div>Нет активного упражнения или повторения</div>;
  }
  return (
    <div className="flex flex-col grow items-center w-full gap-3 flex-wrap">
      <div className="flex items-center justify-center sm:justify-between w-full gap-3 flex-wrap">
        <h2 className="text-2xl md:text-3xl font-bold text-center">{trainingName}</h2>

        <span className="hidden sm:flex font-bold">{format(new Date(), 'dd.MM.yyyy')}</span>
      </div>

      {exerciseList.length > 1 && (
        <Stepper
          className="mb-2"
          steps={exerciseList.map((exercise) => ({ label: exercise.name }))}
          current={exerciseList.findIndex((t) => t.stage === 'active') + 1}
        />
      )}

      <h3 className="px-2 mb-4 text-lg leading-4 text-center">{activeExercise.name}</h3>

      <ul className="flex flex-col items-end w-full pr-2">
        {repetitionList.map((rep, index) => {
          const isPrevBreak = repetitionList[index - 1]?.stage === 'break';
          const isDone = rep.stage === 'done';
          const isActive = rep.stage === 'active';
          const isBreak = rep.stage === 'break';

          return (
            <li key={rep.id} className="flex items-center">
              <span className="mr-1 font-bold">{`${rep.targetCount}`}</span>
              повт. / <span className="ml-1 mr-1 font-bold">{`${rep.targetWeight}`}</span>
              кг
              {isDone && <Check className="ml-3" color="var(--color-primary)" />}
              {isBreak && <Clock4 className="ml-3" color="var(--color-primary)" />}
              {isActive && (
                <MoveLeft
                  className={cn('ml-3', { 'opacity-50': isPrevBreak })}
                  color="var(--color-primary)"
                />
              )}
            </li>
          );
        })}
      </ul>

      {isFunction(appendSlot) ? appendSlot() : appendSlot}
    </div>
  );
}

export { TrainingProgress, type TrainingProgressProps };
