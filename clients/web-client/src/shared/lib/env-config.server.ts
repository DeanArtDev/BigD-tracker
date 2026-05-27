import { z } from 'zod';
import { environmentSchema, environmentConfig } from './enviroument';

const envServerSchema = z
  .object({
    HTTP_API: z.url(),
  })
  .extend({ ...environmentSchema.shape });

function getEnvConfigServer(): z.output<typeof envServerSchema> {
  return envServerSchema.parse({
    HTTP_API: process.env.HTTP_API,
    ...environmentConfig,
  });
}

export { getEnvConfigServer };
