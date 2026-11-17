export interface ContactInfo {
  phone: string | null;
  email: string | null;
  address: string | null;
  workingHours: string | null;
  linkedin: string | null;
  telegram: string | null;
  otherSocial: string | null;
}

/**
 * Contact information configuration.
 * Keep fields as `null` until real, owner-verified values are provided.
 * UI components render each row only when its value is non-null.
 */
export const contactInfo: ContactInfo = {
  phone: '09164006698',
  email: 'binesh.office@gmail.com',
  address: 'شیراز - بلوار مدرس - خیابان آزادگان - کارخانه نوآوری شیراز',
  workingHours: 'شنبه تا چهارشنبه از ساعت ۸ تا ۱۷ - پنجشنبه از ساعت ۸ تا ۱۲',
  linkedin: null,
  telegram: null,
  otherSocial: null
};
