import { z } from 'zod';

const envServerSchema = z.object({
  API_URL: z.string().min(4),
});

function getEnvConfigServer() {
  return envServerSchema.parse({
    API_URL: process.env.API_URL,
  });
}

export { getEnvConfigServer };
