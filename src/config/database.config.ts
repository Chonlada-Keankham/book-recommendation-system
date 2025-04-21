
import * as dotenv from 'dotenv';
dotenv.config();

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
  useRedis: process.env.USE_REDIS === 'true',
  url: process.env.REDIS_URL || 'rediss://default:ATx2AAIjcDFkODkzNTliY2ZhMmQ0ZTIzOGVmY2M0ZjFmMThhNzA4Y3AxMA@wanted-moth-15478.upstash.io:6379',  // ✅ ต่อด้วย URL แทน
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
};

export const baseConfig = {
  baseUrl: process.env.BASE_URL,
};

export const cloudinaryConfig = {
  name: process.env.CLOUDINARY_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

