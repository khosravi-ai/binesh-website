export interface ContactInfo {
  phone: string | null;
  email: string | null;
  address: string | null;
  workingHours: string | null;
  instagram: string | null;
  telegram: string | null;
  bale: string | null;
  linkedin: string | null;
  otherSocial: string | null;
}

/**
 * Contact information configuration.
 * Keep fields as `null` until real, owner-verified values are provided.
 * UI components render each row only when its value is non-null.
 */
export const contactInfo: ContactInfo = {
  phone: '09164006698',
  email: 'info@bineshbi.ir',
  address: 'شیراز - بلوار مدرس - خیابان آزادگان - کارخانه نوآوری شیراز',
  workingHours: 'شنبه تا چهارشنبه از ساعت ۸ تا ۱۷ - پنجشنبه از ساعت ۸ تا ۱۲',
  instagram: null,
  telegram: null,
  bale: null,
  linkedin: null,
  otherSocial: null
};

/**
 * Validates and normalizes social media URLs so only safe http/https links are rendered.
 */
export function getSafeExternalUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return null;
  }
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
