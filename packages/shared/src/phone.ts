import {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
  type CountryCode,
} from 'libphonenumber-js';

export const DEFAULT_COUNTRY: CountryCode = 'GB';

export function isValidPhone(value: string, country: CountryCode = DEFAULT_COUNTRY): boolean {
  if (!value) return false;
  return isValidPhoneNumber(value, country);
}

export function normalizePhone(
  value: string,
  country: CountryCode = DEFAULT_COUNTRY,
): string | null {
  const parsed = parsePhoneNumberFromString(value, country);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}

export function formatPhoneDisplay(
  value: string,
  country: CountryCode = DEFAULT_COUNTRY,
): string {
  const parsed = parsePhoneNumberFromString(value, country);
  if (!parsed || !parsed.isValid()) return value;
  return parsed.country === country ? parsed.formatNational() : parsed.formatInternational();
}
