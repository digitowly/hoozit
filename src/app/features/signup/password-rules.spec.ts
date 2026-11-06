import { describe, expect, it } from 'vitest';
import { checkPassword, isPasswordValid, isValidEmail } from './password-rules';

describe('checkPassword', () => {
  it('accepts a password meeting every rule', () => {
    expect(isPasswordValid(checkPassword('Secret1!'))).toBe(true);
  });

  it('reports each missing rule', () => {
    expect(checkPassword('Sec1!').hasMinLength).toBe(false);
    expect(checkPassword('secret1!').hasUppercase).toBe(false);
    expect(checkPassword('SECRET1!').hasLowercase).toBe(false);
    expect(checkPassword('Secrets!').hasNumber).toBe(false);
    expect(checkPassword('Secret12').hasSpecialCharacter).toBe(false);
  });

  it('counts length in bytes, like Scout', () => {
    expect(checkPassword('ääää').hasMinLength).toBe(true);
    expect(checkPassword('a'.repeat(72)).isWithinMaxLength).toBe(true);
    expect(checkPassword('a'.repeat(73)).isWithinMaxLength).toBe(false);
    expect(checkPassword('ä'.repeat(37)).isWithinMaxLength).toBe(false);
  });

  it('treats letters from other alphabets as letters', () => {
    const checks = checkPassword('Äöü');

    expect(checks.hasUppercase).toBe(true);
    expect(checks.hasLowercase).toBe(true);
    expect(checks.hasSpecialCharacter).toBe(false);
  });

  it('rejects a too long password with every character type', () => {
    expect(isPasswordValid(checkPassword('Aa1!' + 'a'.repeat(69)))).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts what Scout accepts', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('  a@b.co  ')).toBe(true);
    expect(isValidEmail('a@b@c.co')).toBe(true);
  });

  it('rejects what Scout rejects', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('a.co')).toBe(false);
    expect(isValidEmail('@b.co')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
  });
});
