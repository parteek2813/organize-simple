// making a config for usage in entire application
export default () => ({
  nodeEnv: process.env.NODE_ENV,
  postgres: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5433,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
  // popplerBinariesPath: process.env.POPPLER_BIN_PATH, // not needed for windows
  openaiApiKey: process.env.OPENAI_API_KEY,
});
