type StripApiPrefix<K extends string> = K extends `/api/${infer Rest}` ? `/${Rest}` : K;

type StripApiRoutes<T extends Record<string, any>> = {
  [K in keyof T as K extends string ? StripApiPrefix<K> : never]: T[K];
};

export type { StripApiRoutes };
