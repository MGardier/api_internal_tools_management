import { z } from 'zod';

export const envSchema = z.object({
  // HTTP
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
  LOG_FORMAT: z.enum(['json', 'visual', 'both']).default('visual'),

  /* #################### DATABASE ########################### */

  DATABASE_URL: z.url({
    error: (iss) =>
      iss.input === undefined
        ? 'You must provide DATABASE_URL.'
        : 'DATABASE_URL must be a valid URL.',
  }),
  SHOW_SQL: z
    .enum(['true', 'false', '1', '0'])
    .catch('false')
    .transform((val) => val === 'true' || val === '1'),

  // POSTGRES (Docker)
  POSTGRES_DATABASE: z.string({
    error: (iss) =>
      iss.input === undefined
        ? 'You must provide POSTGRES_DATABASE.'
        : 'POSTGRES_DATABASE must be a string.',
  }),
  POSTGRES_USER: z.string({
    error: (iss) =>
      iss.input === undefined
        ? 'You must provide POSTGRES_USER.'
        : 'POSTGRES_USER must be a string.',
  }),
  POSTGRES_PASSWORD: z.string({
    error: (iss) =>
      iss.input === undefined
        ? 'You must provide POSTGRES_PASSWORD.'
        : 'POSTGRES_PASSWORD must be a string.',
  }),
  POSTGRES_PORT: z
    .string({
      error: (iss) =>
        iss.input === undefined
          ? 'You must provide POSTGRES_PORT.'
          : 'POSTGRES_PORT must be a string.',
    })
    .pipe(z.coerce.number({ error: 'POSTGRES_PORT must be a valid number.' })),

  // PGADMIN (Docker)
  PGADMIN_EMAIL: z.email({
    error: (iss) =>
      iss.input === undefined
        ? 'You must provide PGADMIN_EMAIL.'
        : 'PGADMIN_EMAIL must be a valid email.',
  }),
  PGADMIN_PASSWORD: z.string({
    error: (iss) =>
      iss.input === undefined
        ? 'You must provide PGADMIN_PASSWORD.'
        : 'PGADMIN_PASSWORD must be a string.',
  }),
  PGADMIN_PORT: z
    .string({
      error: (iss) =>
        iss.input === undefined
          ? 'You must provide PGADMIN_PORT.'
          : 'PGADMIN_PORT must be a string.',
    })
    .pipe(z.coerce.number({ error: 'PGADMIN_PORT must be a valid number.' })),
});

export type EnvConfig = z.infer<typeof envSchema>;
