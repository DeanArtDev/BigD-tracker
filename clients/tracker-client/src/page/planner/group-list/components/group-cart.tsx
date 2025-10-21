import { ButtonChevron } from '@/shared/ui-kit/ui/button-chevron';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui-kit/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui-kit/ui/collapsible';
import { type ReactNode, useState } from 'react';

interface GroupCartProps {
  readonly groupId: number;
  readonly name: string;
  readonly description?: string;
  readonly beforeCollapseTriggerSlot: ReactNode;
  readonly onClick?: (groupId: number) => void;
}

function GroupCart({
  name,
  groupId,
  description,
  beforeCollapseTriggerSlot,
  onClick,
}: GroupCartProps) {
  const [collapsed, setCollapsed] = useState(true);

  const hasDescription = description != null && description.length > 0;

  return (
    <Card className="group/group-card gap-0 w-full grow py-3 md:py-6">
      <CardHeader className="w-full px-3 md:px-6 gap-0">
        <CardTitle className="my-auto cursor-pointer" onClick={() => void onClick?.(groupId)}>
          {name}
        </CardTitle>
      </CardHeader>

      <Collapsible className="flex flex-col">
        <CollapsibleContent>
          <CollapsibleTrigger asChild onClick={() => void setCollapsed((prev) => !prev)}>
            <CardDescription className="p-3 md:p-6">{description}</CardDescription>
          </CollapsibleTrigger>
        </CollapsibleContent>

        <div className="flex justify-end pr-2 gap-2 md:pr-6">
          {beforeCollapseTriggerSlot}

          {hasDescription && (
            <CollapsibleTrigger asChild>
              <ButtonChevron open={!collapsed} onClick={() => void setCollapsed((prev) => !prev)} />
            </CollapsibleTrigger>
          )}
        </div>
      </Collapsible>
    </Card>
  );
}

export { GroupCart, type GroupCartProps };
