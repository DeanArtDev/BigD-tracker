'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useNotify } from '@/shared/project-ui';
import { Button } from '@/shared/ui-kit';

interface Props {
  readonly correlationId: string;
}

function CopyCorrelationIdButton({ correlationId }: Props) {
  const [copied, setCopied] = useState(false);
  const { error, success } = useNotify();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(correlationId);
      setCopied(true);
      success({ message: 'ID запроса скопирован' });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      error({ message: 'Не удалось скопировать ID запроса' });
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy} aria-label="Скопировать ID запроса">
      {copied ? <Check /> : <Copy />}
      {copied ? 'Скопировано' : 'Копировать'}
    </Button>
  );
}

export { CopyCorrelationIdButton };
