import { z } from 'zod';
import { environmentConfig, environmentSchema } from './enviroument';

const envServerSchema = z
  .object({
    BACK_TO_BACK_URL: z.string().min(4),
  })
  .extend({ ...environmentSchema.shape });

function getEnvConfigServer(): z.output<typeof envServerSchema> {
  return envServerSchema.parse({
    ...environmentConfig,
    BACK_TO_BACK_URL: process.env.BACK_TO_BACK_URL,
  });
}

export { getEnvConfigServer };
