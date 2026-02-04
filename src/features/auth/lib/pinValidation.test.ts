import { describe, it, expect } from 'vitest';
import { validatePinFormat } from './pinValidation';

describe('pinValidation', () => {
  it('accepts 4-digit PINs', () => {
    expect(validatePinFormat('1234')).toBe(true);
    expect(validatePinFormat('0000')).toBe(true);
    expect(validatePinFormat('9999')).toBe(true);
  });

  it('rejects non-4-digit strings', () => {
    expect(validatePinFormat('123')).toBe(false);
    expect(validatePinFormat('12345')).toBe(false);
    expect(validatePinFormat('')).toBe(false);
  });

  it('rejects non-numeric strings', () => {
    expect(validatePinFormat('abcd')).toBe(false);
    expect(validatePinFormat('12ab')).toBe(false);
    expect(validatePinFormat('12.4')).toBe(false);
  });
});
