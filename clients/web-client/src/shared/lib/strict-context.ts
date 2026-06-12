'use client';

import { type Context, createContext, useContext } from 'react';

function useStrictContext<T>(context: Context<T | null>) {
  const value = useContext(context);
  if (value === null) throw new Error('Strict context not passed');
  return value as T;
}

function createStrictContext<T>() {
  return createContext<T | null>(null);
}

export { createStrictContext, useStrictContext };
