import { z } from 'zod';
import 'dotenv/config';

const environmentSchema = z.object({
  NODE_ENV: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
});

const {
  NODE_ENV,
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} = process.env;

// Check if any req. env. variable is missing
const missingVariables = Object.keys(environmentSchema.shape).filter(
  (key) => !process.env[key],
);

// print missing variables if any!
if (missingVariables.length > 0) {
  console.error(
    `Missing environment variables: ${missingVariables.join(', ')}`,
  );
  throw new Error('Some required environment varibales are missing ');
}

const parsedResults = environmentSchema.safeParse({
  NODE_ENV,
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
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
