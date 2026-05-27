import { create } from 'zustand';
import { ApiError } from '@/shared/transport/graphql';

interface TErrorRectorStore {
  readonly error: ApiError | null;
  readonly report: (error: ApiError) => void;
  readonly clear: () => void;
}

const useReactorStore = create<TErrorRectorStore>((set) => ({
  error: null,
  report: (error) => set({ error }),
  clear: () => set({ error: null }),
}));

const currentError = useReactorStore.getState().error;
const report = useReactorStore.getState().report;
const clear = useReactorStore.getState().clear;

export { currentError, report, clear, useReactorStore };
