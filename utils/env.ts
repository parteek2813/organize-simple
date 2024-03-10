import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POPPLER_BIN_PATH: z.string(),
});

const {
  NODE_ENV,
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POPPLER_BIN_PATH,
} = process.env;

const parsedResults = environmentSchema.safeParse({
  NODE_ENV,
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POPPLER_BIN_PATH,
});

if (!parsedResults.success) {
  console.error(parsedResults);
  throw new Error("Environment don't match the schema");
}

export const environmentVariables = parsedResults.data;

type EnvVarSchemaType = z.infer<typeof environmentSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvVarSchemaType {}
  }
}
