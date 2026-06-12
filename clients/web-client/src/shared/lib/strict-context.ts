'use client';

import { type Context, createContext, useContext } from 'react';

function useStrictContext<T>(context: Context<T | null>) {
  const value = useContext(context);
  if (value === null) throw new Error('Strict context not passed');
  return value as T;
}

function createStrictContext<T>(defaultValue?: T): Context<T | null> {
  return createContext<T | null>(defaultValue ?? null);
}

export { createStrictContext, useStrictContext };
