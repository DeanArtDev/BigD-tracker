import Image from 'next/image';
import { cn } from '@/shared/ui-kit';

interface AuthIllustrationPanelProps {
  readonly className?: string;
}

function AuthIllustrationPanel({ className }: AuthIllustrationPanelProps) {
  return (
    <section
      className={cn(
        'from-primary to-primary/80 text-primary-foreground relative isolate flex h-full w-full overflow-hidden rounded-[18px] bg-linear-to-br px-11 pt-10 pb-11',
        className,
      )}
      aria-labelledby="auth-illustration-title"
    >
      <Image
        aria-hidden
        alt=""
        className="pointer-events-none absolute top-[36.85%] left-[8.86%] h-auto w-[82.28%] select-none opacity-[0.16]"
        src="/auth-illustration-logo.png"
        width={520}
        height={224}
        priority
      />

      <div className="relative mt-auto flex w-full flex-col gap-[18px]">
        <h1
          id="auth-illustration-title"
          className="text-[38px] leading-[1.06] font-medium tracking-[-0.7px] text-balance"
        >
          Управлять можно только тем, что измеримо.
        </h1>

        <p className="text-sm leading-[1.5] opacity-75">Сосредоточьтесь на действиях. Остальному дайте быть.</p>
      </div>
    </section>
  );
}

export { AuthIllustrationPanel, type AuthIllustrationPanelProps };
