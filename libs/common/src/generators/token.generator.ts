import { randomBytes } from 'crypto';

export const generateToken = (): string => {
  return randomBytes(16).toString('hex');
};
