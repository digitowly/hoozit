const MIN_PASSWORD_BYTES = 8;
const MAX_PASSWORD_BYTES = 72;

export interface PasswordChecks {
  hasMinLength: boolean;
  isWithinMaxLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialCharacter: boolean;
}

// Mirrors Scout's rules for live feedback. Scout stays the source of truth.
export function checkPassword(password: string): PasswordChecks {
  const bytes = new TextEncoder().encode(password).length;
  return {
    hasMinLength: bytes >= MIN_PASSWORD_BYTES,
    isWithinMaxLength: bytes <= MAX_PASSWORD_BYTES,
    hasUppercase: /\p{Uppercase}/u.test(password),
    hasLowercase: /\p{Lowercase}/u.test(password),
    hasNumber: /\p{N}/u.test(password),
    hasSpecialCharacter: /[^\p{Alphabetic}\p{N}]/u.test(password),
  };
}

export function isPasswordValid(checks: PasswordChecks): boolean {
  return Object.values(checks).every(Boolean);
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  const separator = trimmed.indexOf('@');
  return separator > 0 && trimmed.slice(separator + 1).includes('.');
}
