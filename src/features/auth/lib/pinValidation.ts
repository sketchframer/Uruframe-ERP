export function validatePinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
