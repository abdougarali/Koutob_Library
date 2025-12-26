import crypto from "crypto";

/**
 * Generate a secure random token for password reset
 * @param length - Length of the token (default: 32)
 * @returns Random hexadecimal token
 */
export function generateResetToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Hash a token for storage in database
 * @param token - Plain token
 * @returns Hashed token
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

























