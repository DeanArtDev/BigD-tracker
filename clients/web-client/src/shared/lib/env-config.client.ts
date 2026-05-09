import { z } from 'zod';

const envClientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().min(4),
  NEXT_PUBLIC_WS_URL: z.string().min(4),
});

function getEnvConfigClient() {
  return envClientSchema.parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  });
}

export { getEnvConfigClient };
