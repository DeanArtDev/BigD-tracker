import type { ReactNode } from 'react';

interface DialViewProps {
  readonly progress: number;
  readonly contentSlot: ReactNode;
  readonly afterSlot: ReactNode;
  readonly progressColor?: string;
}

function DialView({
  progress,
  contentSlot,
  afterSlot,
  progressColor = 'var(--color-primary)',
}: DialViewProps) {
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const center = 295 / 2;
  const tickLength = 8;
  const tickCount = 60;

  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 2 * Math.PI;
    const x1 = center + (radius - 16) * Math.cos(angle);
    const y1 = center + (radius - 16) * Math.sin(angle);
    const x2 = center + (radius - 16 - tickLength) * Math.cos(angle);
    const y2 = center + (radius - 16 - tickLength) * Math.sin(angle);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2" />;
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-[295px] h-[295px] bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-full overflow-hidden">
        <svg className="absolute top-0 left-0 w-full h-full rotate-[-90deg] ">
          {ticks}

          <circle cx="50%" cy="50%" r={radius} stroke="#334155" strokeWidth="12" fill="none" />

          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={progressColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * progress) / 100}
            fill="none"
            strokeLinecap="round"
            className="transition-all duration-100 ease-linear"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-6xl tracking-wide">
          {contentSlot}
        </div>
      </div>

      {afterSlot}
    </div>
  );
}

export { DialView, type DialViewProps };
