import { http, HttpResponse } from 'msw';

const handlers = [
  // Default health endpoint for tests that might touch network accidentally.
  http.get('/__msw__/health', () => HttpResponse.json({ ok: true })),
];

export { handlers };
