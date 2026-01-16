import { HtmlSanitizer } from '@/modules/tasks/domain/ports';
import sanitizeHtml from 'sanitize-html';

class SanitizeHtmlAdapter implements HtmlSanitizer {
  sanitize(input: string): string {
    return sanitizeHtml(input, {
      allowedIframeHostnames: ['www.youtube.com'],

      allowedStyles: {},
      transformTags: {
        a: (tagName, attribs) => ({
          tagName,
          attribs: {
            ...attribs,
            rel: 'noopener noreferrer nofollow',
            target: attribs.target ?? '_blank',
          },
        }),
      },
    });
  }
}

export { SanitizeHtmlAdapter };
