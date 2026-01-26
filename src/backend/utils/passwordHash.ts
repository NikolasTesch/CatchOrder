import bcrypt from 'bcrypt';

/**
 * Hashes a password using bcrypt with 10 salt rounds.
 * @param password The plain text password to encrypt.
 * @returns The resulting hash.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verifies a password against a hash.
 * @param plain The plain text password to check.
 * @param hashed The hashed password to compare against.
 * @returns True if valid, False otherwise.
 */
export const verifyPassword = async (plain: string, hashed: string): Promise<boolean> => {
  return await bcrypt.compare(plain, hashed);
};
