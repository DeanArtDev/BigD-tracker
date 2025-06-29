import { z } from 'zod';
import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import { apiPublicClient } from '@/shared/api/api-client';
import { AccessTokenLsManager } from './access-token-ls';
import { jwtDecode } from 'jwt-decode';

let awaiter: Promise<string | null> | null = null;

interface AccessTokenStore {
  accessToken: string | undefined;
  setAccessToken: (value: string | undefined) => void;
  refreshToken: () => Promise<string | null>;
  validateToken: (token: string) => boolean;
}

const safeAccessTokenStorage: PersistStorage<{ accessToken?: string }> = {
  getItem: (): StorageValue<{ accessToken?: string }> => {
    const lsValue = AccessTokenLsManager.getValue(
      'accessToken',
      z.object({
        state: z.object({ accessToken: z.string().jwt() }),
        version: z.number(),
      }),
    );
    if (lsValue == null) {
      return { state: {}, version: 0 };
    }

    return lsValue;
  },

  setItem: (_, value) => {
    if (value.state.accessToken != null) {
      AccessTokenLsManager.setValue(
        'accessToken',
        JSON.stringify({
          state: { accessToken: value.state.accessToken },
          version: value.version,
        }),
      );
    } else {
      AccessTokenLsManager.removeValue('accessToken');
    }
  },
  removeItem: () => {
    AccessTokenLsManager.removeValue('accessToken');
  },
};

const useAccessTokenStore = create<AccessTokenStore>()(
  persist(
    (set) => ({
      accessToken: undefined,
      validateToken: (token: string) => {
        const payload = jwtDecode<{ exp: number }>(token);
        return payload.exp > Date.now() / 1000;
      },
      setAccessToken: (value: string | undefined) =>
        void set((state) => ({ ...state, accessToken: value })),
      refreshToken: async () => {
        if (awaiter == null) {
          awaiter = apiPublicClient
            .POST('/auth/refresh')
            .then(({ data }) => data?.data.token ?? null)
            .then((newToken) => (newToken != null ? newToken : null))
            .finally(() => {
              awaiter = null;
            });
        }

        const result = await awaiter;
        set((state) => ({ ...state, accessToken: result ?? undefined }));
        return result;
      },
    }),
    {
      name: 'accessToken',
      storage: safeAccessTokenStorage,
      partialize: (state) => ({ accessToken: state.accessToken }),
    },
  ),
);

const setAccessToken = useAccessTokenStore.getState().setAccessToken;
const validateToken = useAccessTokenStore.getState().validateToken;
const refreshToken = useAccessTokenStore.getState().refreshToken;

export { useAccessTokenStore, setAccessToken, validateToken, refreshToken };
