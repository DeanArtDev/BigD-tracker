import { debounce } from 'lodash-es';
import { useCallback, useEffect } from 'react';
import { useEventUpdate } from './use-event-update';
import { useDiaryContext } from '../../context';

const UPDATE_DEBOUNCE_MS = 500;

function useEventUpdateSubscription() {
  const { app } = useDiaryContext();
  const getApp = useCallback(() => app, [app]);
  const { persistEventUpdate } = useEventUpdate({ getApp });

  useEffect(() => {
    const debouncedUpdateEvent = debounce(persistEventUpdate, UPDATE_DEBOUNCE_MS);

    const unsubscribe = app.subscribeEventChanges((changes) => {
      changes.forEach((change) => {
        if (change.type !== 'update' || change.source === 'remote') return;

        /*TODO:
         * - resize сохраняется в плагине, так как событие type === resize
         *   даты эветнов приходят одинаковые как в after так и в before
         * */
        if (change.source === 'resize') {
          debouncedUpdateEvent.cancel();
          return;
        }

        debouncedUpdateEvent(change.after, change.before, { loading: change.source !== 'drag' });
      });
    });

    return () => {
      unsubscribe();
      debouncedUpdateEvent.cancel();
    };
  }, [app, persistEventUpdate]);
}

export { useEventUpdateSubscription };
