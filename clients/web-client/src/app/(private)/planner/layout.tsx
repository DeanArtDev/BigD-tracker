import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Планировщик',
};

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
