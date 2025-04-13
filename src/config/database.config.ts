
export const databaseConfig = {
  uri: process.env.DATABASE_URI || 'mongodb+srv://chonladakkc:14s8gNYixQGlHWcJ@cluster0.8xmiy.mongodb.net/pj-recommend?retryWrites=true&w=majority&appName=Cluster0',
};

export const frontendConfig = {
  url: process.env.frontendUrl || 'http://localhost:3000',
};

export const backendConfig = {
  url: process.env.BACKEND_URL || 'https://19cb-2001-fb1-2d-d1bf-519e-c229-ff27-16bb.ngrok-free.app',
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'qlAlZQYEa0hsTWxe8ST6RIQR8GRfBc',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
};

export const fileConfig = {
  profilePath: process.env.PROFILE_PATH || './uploads/profile',
  backgroundPath: process.env.BACKGROUND_PATH || './uploads/background',
  maxFileSize: process.env.MAX_FILE_SIZE || 5242880,
};

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

export const baseConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
};
