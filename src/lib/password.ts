import { createHash } from 'crypto';

const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER ?? 'restcrew-demo-pepper';

export function hashPassword(password: string) {
  return createHash('sha256')
    .update(`${PASSWORD_PEPPER}:${password}`)
    .digest('hex');
}

export function verifyPassword(password: string, hashedPassword: string) {
  return hashPassword(password) === hashedPassword;
}
