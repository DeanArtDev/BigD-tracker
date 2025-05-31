import { type PropsWithChildren } from 'react';

function RequiredSign({ on = true, children }: PropsWithChildren<{ on?: boolean }>) {
  return (
    <span className="flex">
      {on && <sup className="pr-0.5 flex items-center text-destructive">*</sup>}
      {children}
    </span>
  );
}

export { RequiredSign };
