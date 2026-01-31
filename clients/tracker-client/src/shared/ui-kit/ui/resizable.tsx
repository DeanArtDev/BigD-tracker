import * as React from 'react';
import { GripVerticalIcon } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';

import { cn } from '@/shared/ui-kit/utils';
import { Button } from './button';

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Group>) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      data-panel-group-direction={props.orientation}
      className={cn(
        'group/resizable-panel-group flex h-full w-full group-data-[panel-group-direction=vertical]/resizable-panel-group:flex-col',
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel({ ...props }: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        'bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden',
        'group-data-[panel-group-direction=vertical]/resizable-panel-group:h-px ' +
          'group-data-[panel-group-direction=vertical]/resizable-panel-group:w-full ' +
          'group-data-[panel-group-direction=vertical]/resizable-panel-group:after:left-0 ' +
          'group-data-[panel-group-direction=vertical]/resizable-panel-group:after:h-1 ' +
          'group-data-[panel-group-direction=vertical]/resizable-panel-group:after:w-full ' +
          'group-data-[panel-group-direction=vertical]/resizable-panel-group:after:translate-x-0 ' +
          'group-data-[panel-group-direction=vertical]/resizable-panel-group:after:-translate-y-1/2 ' +
          'group-data-[panel-group-direction=vertical]/resizable-panel-group:after:-translate-y-1/2 ' +
          'group-data-[panel-group-direction=vertical]/resizable-panel-group:[&>button]:rotate-90',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <Button
          size="icon-sm"
          variant="ghost"
          type="button"
          className={cn(
            'h-10 w-3 rounded-md items-center justify-center bg-gray-200 select-none touch-none',
            'group-data-[panel-group-direction=vertical]/resizable-panel-group:w-7',
            'group-data-[panel-group-direction=vertical]/resizable-panel-group:h-15',
          )}
        >
          <GripVerticalIcon className="size-2.5 group-data-[panel-group-direction=vertical]/resizable-panel-group:size-4" />
        </Button>
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
