import { RepetitionItemPreview } from './repetition-item-preview';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { Button } from '@/shared/ui-kit/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui-kit/ui/collapsible';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Fragment, useState } from 'react';

interface ExerciseItemPreviewProps {
  readonly index: number;
  readonly name: string;
  readonly type: string;
  readonly repetitions: {
    readonly targetCount: number;
    readonly targetBreak: number;
    readonly targetWeight: string;
  }[];
}

function ExerciseItemPreview({ type, name, repetitions, index }: ExerciseItemPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex gap-2 items-center border rounded-md p-2 bg-white relative">
        <span>{index}.</span>

        <span className="text-sm">{name}</span>

        <Badge className="self-center ml-auto" variant="secondary">
          {type}
        </Badge>

        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void setIsOpen((prev) => !prev)}
          >
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="ml-[10%] mt-[-10px] pt-4 p-2 overflow-hidden text-xs border-x border-b rounded-bl-md rounded-br-md">
        <ul className="flex flex-col grow gap-3">
          {repetitions.map((rep, idx) => {
            return (
              <Fragment key={idx}>
                <RepetitionItemPreview
                  index={idx}
                  count={rep.targetCount}
                  weight={rep.targetWeight}
                  breakDuration={rep.targetBreak}
                />
                <Separator className="last-of-type:hidden" />
              </Fragment>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export { ExerciseItemPreview, type ExerciseItemPreviewProps };
