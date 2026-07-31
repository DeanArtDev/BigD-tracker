'use client';

import { Tabs, TabsList, TabsTrigger } from '@/shared/ui-kit';
import { useDiaryContext } from '../context';
import { type YearViewMode, YEAR_VIEW_MODES } from '../view-model/use-views';

const YEAR_VIEW_MODE_LABELS: Record<YearViewMode, string> = {
  'year-canvas': 'Лента',
  'fixed-week': 'Недели',
  'grid': 'Сетка',
};

function isYearViewMode(value: string): value is YearViewMode {
  return YEAR_VIEW_MODES.some((mode) => mode === value);
}

function YearViewModeTabs() {
  const { setYearViewMode, yearViewMode } = useDiaryContext();

  return (
    <Tabs
      className="gap-0"
      onValueChange={(value) => {
        if (isYearViewMode(value)) setYearViewMode(value);
      }}
      value={yearViewMode}
    >
      <TabsList variant="line" aria-label="Режим отображения года">
        {YEAR_VIEW_MODES.map((mode) => (
          <TabsTrigger key={mode} value={mode} className="border-none after:bg-primary after:rounded-2xl">
            {YEAR_VIEW_MODE_LABELS[mode]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export { YearViewModeTabs };
