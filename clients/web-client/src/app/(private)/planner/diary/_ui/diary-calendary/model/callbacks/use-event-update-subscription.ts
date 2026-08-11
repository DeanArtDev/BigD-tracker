import { debounce } from 'lodash-es';
import { useCallback, useEffect } from 'react';
import { useEventUpdate } from './use-event-update';
import { useDiaryContext } from '../../context';

const UPDATE_DEBOUNCE_MS = 500;

function useEventUpdateSubscription() {
  const { calendar } = useDiaryContext();
  const app = calendar.app;
  const getApp = useCallback(() => app, [app]);
  const { persistEventUpdate } = useEventUpdate({ getApp });

  useEffect(() => {
    const debouncedUpdateEvent = debounce(persistEventUpdate, UPDATE_DEBOUNCE_MS);

    const unsubscribe = app.subscribeEventChanges((changes) => {
      changes.forEach((change) => {
        if (change.type !== 'update' || change.source === 'remote') return;

        /*TODO:
         *
         * - drag вызывается в плагине
         * - resize вызывается в плагине
         *
         * */
        if (change.source === 'resize' || change.source === 'drag') {
          debouncedUpdateEvent.cancel();
          return;
        }

        debouncedUpdateEvent(change.after, change.before);
      });
    });

    return () => {
      unsubscribe();
      debouncedUpdateEvent.cancel();
    };
  }, [app, persistEventUpdate]);
}

export { useEventUpdateSubscription };
