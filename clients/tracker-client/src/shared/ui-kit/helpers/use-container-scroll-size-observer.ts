import { useContainerSizeObserver } from './use-container-size-observer';

function useContainerScrollSizeObserver<T extends HTMLElement = HTMLElement>(
  params: { updateDelay?: number } = {},
) {
  const { ref } = useContainerSizeObserver<T>(params);

  return {
    ref,
    height: ref?.current?.scrollHeight ?? 0,
    width: ref?.current?.scrollWidth ?? 0,
  };
}

export { useContainerScrollSizeObserver };
