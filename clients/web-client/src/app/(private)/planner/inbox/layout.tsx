import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'INBOX',
};

export default async function InboxPageLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
