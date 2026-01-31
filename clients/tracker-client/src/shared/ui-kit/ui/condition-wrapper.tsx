import type { PropsWithChildren, JSX, ReactNode } from 'react';

interface ConditionWrapProps extends PropsWithChildren {
  if: boolean;
  with: (props: { children: ReactNode }) => JSX.Element;
}

function ConditionWrap({ if: condition, with: wrapper, children }: ConditionWrapProps) {
  return condition ? wrapper({ children }) : children;
}

export { ConditionWrap, type ConditionWrapProps };
