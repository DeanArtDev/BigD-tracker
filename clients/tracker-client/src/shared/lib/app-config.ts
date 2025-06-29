const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api',
} as const;

export { APP_CONFIG };
