import { useEffect, useEffectEvent } from 'react';
import { useIsMounted } from './use-is-mounted';

function useOnUnmount(callback: () => void) {
  const isMounted = useIsMounted();
  const callbackEvent = useEffectEvent(callback);

  useEffect(
    () => () => {
      if (isMounted) {
        callbackEvent();
      }
    },
    [isMounted],
  );
}

export { useOnUnmount };
