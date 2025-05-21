import { LocalStorageManager } from '@/shared/lib/local-storage-manager';
import { z } from 'zod';

const AccessTokenLsManager = new LocalStorageManager(
  z.object({ accessToken: z.string() }),
);

export { AccessTokenLsManager };
