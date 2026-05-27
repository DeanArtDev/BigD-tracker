import { z } from 'zod';
import { environmentConfig, environmentSchema } from './enviroument';

const envClientSchema = z
  .object({
    NEXT_PUBLIC_HTTP_API_URL: z.string().min(4),
    NEXT_PUBLIC_WS_API_URL: z.string().min(4),
  })
  .extend({ ...environmentSchema.shape });

function getEnvConfigClient(): z.output<typeof envClientSchema> {
  return envClientSchema.parse({
    ...environmentConfig,
    NEXT_PUBLIC_HTTP_API_URL: process.env.NEXT_PUBLIC_HTTP_API_URL,
    NEXT_PUBLIC_WS_API_URL: process.env.NEXT_PUBLIC_WS_API_URL,
  });
}

export { getEnvConfigClient };
