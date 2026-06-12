'use client';

import { useBasicTypeaheadTriggerMatch } from '@lexical/react/LexicalTypeaheadMenuPlugin';

function useComponentTriggerMatch() {
  const matchSlash = useBasicTypeaheadTriggerMatch('/', {
    allowWhitespace: true,
    minLength: 0,
  });

  const matchDot = useBasicTypeaheadTriggerMatch('.', {
    allowWhitespace: true,
    minLength: 0,
  });

  return { matchSlash, matchDot };
}

export { useComponentTriggerMatch };
