export const databaseConfig = {
  uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/mydb',
};

export const frontendConfig = {
  url: process.env.FRONTEND_URL || 'http://localhost:3000',
};

export const backendConfig = {
  url: process.env.BACKEND_URL || 'http://localhost:5000',
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default-jwt-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
};

export const fileConfig = {
  profilePath: process.env.PROFILE_PATH || './uploads/profile',
  backgroundPath: process.env.BACKGROUND_PATH || './uploads/background',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
};

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
};

export const baseConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
};
