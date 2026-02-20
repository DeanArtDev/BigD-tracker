import type { ApiSchemas } from '@/shared/api/types';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { Button } from '@/shared/ui-kit/ui/button';

interface FirstStepProps {
  readonly trainingName: string;
  readonly trainingType: ApiSchemas['TrainingWithExercisesDto']['type'];
  readonly onStart?: () => void;
}

function FirstStep({ trainingType, trainingName, onStart }: FirstStepProps) {
  return (
    <div className="flex flex-col grow items-center w-full gap-3 flex-wrap">
      <span>
        {`Сегодня тебя ждет: `}
        <Badge variant="secondary" className="mt-1 h-min">
          {trainingType}
        </Badge>
      </span>
      <div className="px-2 flex items-center gap-2">
        <h2 className="text-2xl md:text-xl font-bold text-center">{trainingName}</h2>
      </div>

      <Button
        size="lg"
        className="rounded-full my-auto w-fit h-[100px] shadow text-3xl mx-auto py-6"
        onClick={onStart}
      >
        Начать?
      </Button>
    </div>
  );
}

export { FirstStep };
