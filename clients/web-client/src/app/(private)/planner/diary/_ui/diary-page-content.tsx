'use client';

import { useEffect } from 'react';
import { DiaryCalendar } from './diary-calendary';

/* FIXME: wait for the next day-flow update patch */
function DiaryPageContent() {
  useEffect(() => {
    const overlaySelector =
      '[data-slot="alert-dialog-overlay"], [data-slot="alert-dialog-content"], [data-slot="dialog-overlay"], [data-slot="dialog-content"], [data-radix-popper-content-wrapper]';
    const markAsEventDetailDialog = (element: Element) => {
      element.setAttribute('data-event-detail-dialog', 'true');
    };
    const mark = (root: ParentNode) => {
      root.querySelectorAll(overlaySelector).forEach(markAsEventDetailDialog);
    };

    mark(document);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;

          if (node.matches(overlaySelector)) markAsEventDetailDialog(node);
          mark(node);
        });
      });
    });

    observer.observe(document.body, { childList: true });

    return () => observer.disconnect();
  }, []);

  return <DiaryCalendar />;
}

export { DiaryPageContent };
