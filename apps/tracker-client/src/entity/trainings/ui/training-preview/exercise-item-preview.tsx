import { Badge } from '@/shared/ui-kit/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui-kit/ui/collapsible';
import { useState } from 'react';

interface ExerciseItemPreviewProps {
  readonly count: number;
  readonly name: string;
  readonly type: string;
  readonly description?: string;
}

function ExerciseItemPreview({ count, type, name, description }: ExerciseItemPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible className="border rounded-xl grow" open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <li className="p-4 grid grid-cols-[max-content_1fr_max-content_max-content] gap-2 items-center">
          <span>{count}.</span>
          <span className="text-sm md:text-base">{name}</span>
          <div className="ml-auto text-sm mr-1 wrap-break-word">3 / 12</div>
          <Badge className="self-center" variant="secondary">
            {type}
          </Badge>
        </li>
      </CollapsibleTrigger>

      <CollapsibleContent className="text-xs p-4 pt-0">
        <h6 className="font-bold">Описание</h6>
        <p className="whitespace-pre-line text-xs leading-5">{description}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

export { ExerciseItemPreview, type ExerciseItemPreviewProps };
