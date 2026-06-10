import { useEffect, useState } from 'react';

function useDebounce<TValue>(value: TValue, delay: number): TValue {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => void setDebouncedValue(value), delay);
    return () => void clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

export { useDebounce };
