import * as bcrypt from 'bcryptjs';

/**
 * Hash a password with the given number of salt rounds.
 * @param password - The password to hash.
 * @param saltRounds - The number of salt rounds to use for hashing.
 * @returns The hashed password.
 */
export async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with a hashed password.
 * @param password - The plain password to compare.
 * @param hashedPassword - The hashed password to compare with.
 * @returns True if the passwords match, otherwise false.
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
