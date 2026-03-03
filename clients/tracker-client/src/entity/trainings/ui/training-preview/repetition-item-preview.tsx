import { Separator } from '@/shared/ui-kit/ui/separator';

interface RepetitionItemPreviewProps {
  readonly index: number;
  readonly count: number;
  readonly breakDuration: number;
  readonly weight: string;
}

function RepetitionItemPreview({ count, weight, breakDuration, index }: RepetitionItemPreviewProps) {
  return (
    <li className="flex gap-2 grow items-center">
      <span className="ml-3 mr-auto mb-auto">{index + 1}.</span>

      <div className="flex gap-2 grow flex-wrap justify-end">
        <div className="grid grid-cols-[max-content_max-content] gap-2 items-center justify-center">
          <span>Вес:</span>
          <span className="font-bold">{weight}</span>
        </div>

        <Separator className="!h-auto" orientation="vertical" />

        <div className="grid grid-cols-[max-content_max-content] gap-2 items-center justify-center">
          <span>Повторения:</span>
          <span className="font-bold">{count}</span>
        </div>

        <Separator className="!h-auto" orientation="vertical" />

        <div className="grid grid-cols-[max-content_max-content] gap-2 items-center justify-center">
          <span>Перерыв:</span>
          <span className="font-bold">{breakDuration} мин</span>
        </div>
      </div>
    </li>
  );
}

export { RepetitionItemPreview, type RepetitionItemPreviewProps };
