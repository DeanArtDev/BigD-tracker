import { useRef, useState } from 'react';
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts';

interface Size {
  readonly width: number | undefined;
  readonly height: number | undefined;
}

const initialSize: Size = { width: 0, height: 0 };

function useContainerSizeObserver<T extends HTMLElement = HTMLElement>({
  updateDelay = 50,
}: { updateDelay?: number } = {}) {
  // @ts-expect-error
  const containerRer = useRef<T>();
  const [size, setSize] = useState<Size>(initialSize);

  useResizeObserver({
    ref: containerRer,
    box: 'border-box',
    onResize: useDebounceCallback(setSize, updateDelay),
  });

  return {
    ref: containerRer,
    width: size.width ?? 0,
    height: size.height ?? 0,
  };
}

export { useContainerSizeObserver };
