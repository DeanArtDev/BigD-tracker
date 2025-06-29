import { Badge } from '@/shared/ui-kit/ui/badge';
import { Button } from '@/shared/ui-kit/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui-kit/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui-kit/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ExerciseItemPreviewProps {
  readonly index: number;
  readonly name: string;
  readonly type: string;
  readonly repetitions: {
    readonly targetCount: number;
    readonly targetBreak: number;
    readonly targetWeight: string;
    readonly factCount?: number;
    readonly factBreak?: number;
    readonly factWeight?: string;
  }[];
}

function ExerciseItemPreview({ type, name, repetitions, index }: ExerciseItemPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex gap-2 items-center border rounded-md p-2 bg-white relative">
        <span>{index}.</span>

        <span className="text-sm">{name}</span>

        <Badge className="hidden sm:flex self-center ml-auto" variant="secondary">
          {type}
        </Badge>

        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto sm:ml-0"
            onClick={() => void setIsOpen((prev) => !prev)}
          >
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="ml-[5%] sm:ml-[10%] mt-[-10px] pt-2 overflow-hidden text-xs border-x border-b rounded-bl-md rounded-br-md">
        <Table className="text-xs text-center table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left w-full">Подход</TableHead>
              <TableHead className="text-center">Вес</TableHead>
              <TableHead className="text-center">Повторы</TableHead>
              <TableHead className="text-center">Перерыв</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {repetitions.map((rep, idx) => {
              const { targetWeight, targetCount, targetBreak, factCount, factWeight, factBreak } =
                rep;

              const fact =
                factCount != null && factWeight != null && factBreak != null
                  ? {
                      count: factCount,
                      weight: factWeight,
                      break: factBreak,
                    }
                  : undefined;

              return (
                <>
                  <TableRow>
                    <TableCell
                      className="font-bold text-left align-text-top pl-4 sm:pl-7"
                      rowSpan={fact ? 2 : 1}
                    >
                      <div className="flex flex-col">
                        {idx + 1}.{fact && <span className="ml-auto mt-4">Факт:</span>}
                      </div>
                    </TableCell>
                    <DataView break={targetBreak} weight={targetWeight} count={targetCount} />
                  </TableRow>
                  {fact && (
                    <TableRow>
                      <DataView {...fact} />
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DataView(props: {
  readonly count: number;
  readonly break: number;
  readonly weight: string;
}) {
  const w = +props.weight;

  return (
    <>
      <TableCell>{w % 1 !== 0 ? w : Math.trunc(w)}</TableCell>
      <TableCell>{props.count}</TableCell>
      <TableCell>{props.break}</TableCell>
    </>
  );
}

export { ExerciseItemPreview, type ExerciseItemPreviewProps };
