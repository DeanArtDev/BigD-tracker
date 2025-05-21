import { create } from 'zustand';

interface AuthStore {
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
}

const useAuthStore = create<AuthStore>()((set) => ({
  isAuth: false,
  setIsAuth: (value) => void set((state) => ({ ...state, isAuth: value })),
}));

const setIsAuth = useAuthStore.getState().setIsAuth;

export { useAuthStore, setIsAuth };
