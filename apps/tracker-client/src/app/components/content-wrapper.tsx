import type { PropsWithChildren } from 'react';

function ContentWrapper({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col grow h-dvh p-[2px] md:p-[10px] md:pl-0">
      <div className="flex flex-col bg-background rounded-lg grow border overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
}

export { ContentWrapper };
