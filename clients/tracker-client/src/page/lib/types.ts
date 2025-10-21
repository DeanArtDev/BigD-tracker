import type { LucideProps } from 'lucide-react';
import type { JSX } from 'react';
import type { To } from 'react-router-dom';

interface PageApplicationRote {
  readonly to: To;
  readonly title: string;
  readonly icon?: (props: LucideProps) => JSX.Element;
}
type PageApplicationRoutMap = Record<string, PageApplicationRote>;

export type { PageApplicationRoutMap, PageApplicationRote };
