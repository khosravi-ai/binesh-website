import nodemailer from 'nodemailer';
import {
  ConsultationRequestRecord,
  getAllSettings,
  updateConsultationStatus
} from './db.ts';

export interface NotificationResult {
  smsSent: boolean;
  emailSent: boolean;
  log: string;
}

/**
 * Dispatches instant SMS (Kavenegar / MeliPayamak) and Email (SMTP) notifications
 * when a new consultation request is submitted.
 */
export async function dispatchNewConsultationNotifications(
  record: ConsultationRequestRecord
): Promise<NotificationResult> {
  const settings = await getAllSettings();
  const logs: string[] = [];
  let smsSent = false;
  let emailSent = false;

  const adminPhone =
    settings.notifyAdminPhone || process.env.NOTIFY_ADMIN_PHONE || '09164006698';
  const adminEmail =
    settings.notifyAdminEmail || process.env.NOTIFY_ADMIN_EMAIL || 'binesh.office@gmail.com';

  const smsText = `بینش | درخواست مشاوره جدید\nکد رهگیری: ${record.trackingCode}\nنام: ${record.fullName}\nتلفن: ${record.phone}\nخدمت: ${record.service}`;

  // 1. Iranian SMS Gateway Dispatch (Kavenegar or MeliPayamak)
  const smsProvider = (settings.smsProvider || process.env.SMS_PROVIDER || 'kavenegar').toLowerCase();
  const kavenegarKey = settings.kavenegarApiKey || process.env.KAVENEGAR_API_KEY || '';
  const kavenegarSender = settings.kavenegarSender || process.env.KAVENEGAR_SENDER || '';
  const melipayamakUser = settings.melipayamakUsername || process.env.MELIPAYAMAK_USERNAME || '';
  const melipayamakPass = settings.melipayamakPassword || process.env.MELIPAYAMAK_PASSWORD || '';
  const melipayamakFrom = settings.melipayamakFrom || process.env.MELIPAYAMAK_FROM || '';

  if (smsProvider === 'kavenegar' && kavenegarKey) {
    try {
      const params = new URLSearchParams({
        receptor: adminPhone,
        message: smsText
      });
      if (kavenegarSender) {
        params.set('sender', kavenegarSender);
      }
      const url = `https://api.kavenegar.com/v1/${encodeURIComponent(kavenegarKey)}/sms/send.json?${params.toString()}`;
      const res = await fetch(url, { method: 'POST' });
      if (res.ok) {
        smsSent = true;
        logs.push(`پیامک کاوه‌نگار به ${adminPhone} ارسال شد.`);
      } else {
        logs.push(`خطای وب‌سرویس کاوه‌نگار: وضعیت ${res.status}`);
      }
    } catch (err) {
      logs.push(`خطا در اتصال به کاوه‌نگار: ${(err as Error).message}`);
    }
  } else if (smsProvider === 'melipayamak' && melipayamakUser && melipayamakPass && melipayamakFrom) {
    try {
      const res = await fetch('https://rest.payamak-panel.com/api/SendSMS/SendSMS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: melipayamakUser,
          password: melipayamakPass,
          to: adminPhone,
          from: melipayamakFrom,
          text: smsText,
          isFlash: false
        })
      });
      if (res.ok) {
        smsSent = true;
        logs.push(`پیامک ملی‌پیامک به ${adminPhone} ارسال شد.`);
      } else {
        logs.push(`خطای وب‌سرویس ملی‌پیامک: وضعیت ${res.status}`);
      }
    } catch (err) {
      logs.push(`خطا در اتصال به ملی‌پیامک: ${(err as Error).message}`);
    }
  } else {
    logs.push('کلید وب‌سرویس پیامک تنظیم نشده است (اعلان در پنل ادمین ثبت شد).');
  }

  // 2. Standard SMTP Email Dispatch
  const smtpHost = settings.smtpHost || process.env.SMTP_HOST || '';
  const smtpPort = Number(settings.smtpPort || process.env.SMTP_PORT || 587);
  const smtpUser = settings.smtpUser || process.env.SMTP_USER || '';
  const smtpPass = settings.smtpPass || process.env.SMTP_PASS || '';
  const smtpFrom = settings.smtpFrom || process.env.SMTP_FROM || smtpUser || 'noreply@binesh.ir';

  if (smtpHost && smtpUser && smtpPass && adminEmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"بینش (Binesh)" <${smtpFrom}>`,
        to: adminEmail,
        subject: `درخواست مشاوره جدید (${record.trackingCode}) — ${record.fullName}`,
        html: `
          <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; color: #062B4D; line-height: 1.8; max-width: 600px; margin: 0 auto; border: 1px solid #E3EBF0; border-radius: 12px; padding: 24px;">
            <h2 style="color: #062B4D; border-bottom: 2px solid #08A9C5; padding-bottom: 10px;">ثبت درخواست جلسه مشاوره جدید در بینش</h2>
            <p><strong>کد رهگیری:</strong> <span style="font-family: monospace;">${record.trackingCode}</span></p>
            <p><strong>نام و نام خانوادگی:</strong> ${record.fullName}</p>
            <p><strong>نام کسب‌وکار:</strong> ${record.businessName || '—'}</p>
            <p><strong>شماره تماس:</strong> <a href="tel:${record.phone}">${record.phone}</a></p>
            <p><strong>ایمیل:</strong> ${record.email || '—'}</p>
            <p><strong>خدمت موردنظر:</strong> ${record.service}</p>
            <p><strong>توضیحات تکمیلی:</strong><br/>${record.notes || '—'}</p>
            <hr style="border: none; border-top: 1px solid #E3EBF0; margin: 16px 0;" />
            <p style="font-size: 12px; color: #64748B;">این پیام به‌صورت خودکار توسط سامانه مدیریت درخواست‌های بینش ارسال شده است.</p>
          </div>
        `
      });
      emailSent = true;
      logs.push(`ایمیل اطلاع‌رسانی به ${adminEmail} ارسال شد.`);
    } catch (err) {
      logs.push(`خطا در ارسال ایمیل SMTP: ${(err as Error).message}`);
    }
  } else {
    logs.push('تنظیمات SMTP ایمیل وارد نشده است (اعلان در پنل ادمین ثبت شد).');
  }

  const finalLog = logs.join(' | ');
  await updateConsultationStatus(record.id, {
    notifiedSms: smsSent,
    notifiedEmail: emailSent,
    notificationLog: finalLog
  });

  return { smsSent, emailSent, log: finalLog };
}
