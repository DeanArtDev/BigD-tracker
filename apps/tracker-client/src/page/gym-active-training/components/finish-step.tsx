import { Button } from '@/shared/ui-kit/ui/button';

function FinishStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex flex-col grow items-center w-full gap-4 flex-wrap">
      <h2 className="text-2xl md:text-xl font-bold text-center">Все, готово!</h2>

      <p>Все, можно домой, отдыхать и чилить, ты красавчик!</p>

      <Button
        size="lg"
        className="rounded-full my-auto w-fit h-[100px] shadow text-3xl mx-auto py-6"
        onClick={onFinish}
      >
        Завершить
      </Button>
    </div>
  );
}

export { FinishStep };
