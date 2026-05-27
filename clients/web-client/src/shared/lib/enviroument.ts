import z from 'zod';

const environmentConfig = {
  NODE_ENV: process.env.NODE_ENV,
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
};

const environmentSchema = z.object({
  NODE_ENV: z.union([z.literal('production'), z.literal('development'), z.literal('test')]),
  IS_PROD: z.boolean(),
  IS_DEV: z.boolean(),
  IS_TEST: z.boolean(),
});

export { environmentConfig, environmentSchema };
