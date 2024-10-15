import { randomBytes } from 'crypto';

const generateSecretKey = (): string => {
  return randomBytes(32).toString('hex'); 
};

const secretKey = generateSecretKey();
console.log(`JWT_SECRET=${secretKey}`); 