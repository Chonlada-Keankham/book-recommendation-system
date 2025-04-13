export const databaseConfig = {
  uri: process.env.DATABASE_URI,
};

export const frontendConfig = {
  url: process.env.FRONTEND_URL,
};

export const backendConfig = {
  url: process.env.BACKEND_URL,
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
};

export const fileConfig = {
  profilePath: process.env.PROFILE_PATH,
  backgroundPath: process.env.BACKGROUND_PATH,
  maxFileSize: process.env.MAX_FILE_SIZE,
};

export const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const baseConfig = {
  baseUrl: process.env.BASE_URL,
};
