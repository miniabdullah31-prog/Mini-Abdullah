/** Shared client email format check (signup / login). */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const VALID_EMAIL_MESSAGE = "Please enter a valid email address.";

export function isValidEmailFormat(email: string): boolean {
  const value = String(email || "").trim();
  if (!value) return false;
  return EMAIL_REGEX.test(value);
}
