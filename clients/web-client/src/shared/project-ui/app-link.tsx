import NextLink from 'next/link';
import { ComponentProps } from 'react';
import { LinkPendingReporter } from './navigation-progress';

type AppLinkProps = ComponentProps<typeof NextLink>;

function AppLink({ children, ...props }: AppLinkProps) {
  return (
    <NextLink {...props}>
      {children}
      <LinkPendingReporter />
    </NextLink>
  );
}

export { AppLink };
