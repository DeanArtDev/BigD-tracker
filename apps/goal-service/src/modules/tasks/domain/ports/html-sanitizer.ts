const HTML_SANITIZE = Symbol('HTML_SANITIZE');

interface HtmlSanitizer {
  sanitize(input: string): string;
}

export { HTML_SANITIZE, HtmlSanitizer };
