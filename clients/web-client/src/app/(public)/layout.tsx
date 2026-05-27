import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '../_styles/index.css';

export const metadata: Metadata = {
  title: 'Трекер',
};

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}
