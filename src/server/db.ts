import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PORTFOLIO_PLACEHOLDERS, INSIGHTS_PLACEHOLDERS } from '../data/bineshData.ts';
import { contactInfo as initialContactInfo } from '../data/contactInfo.ts';

export type ConsultationStatus = 'new' | 'contacted' | 'in_progress' | 'converted' | 'archived';

export interface ConsultationRequestRecord {
  id: number;
  trackingCode: string;
  fullName: string;
  businessName: string;
  phone: string;
  email: string;
  service: string;
  notes: string;
  status: ConsultationStatus;
  adminNotes: string;
  isRead: boolean;
  notifiedSms: boolean;
  notifiedEmail: boolean;
  notificationLog: string;
  ipAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioRecord {
  id: string;
  title: string;
  clientName: string;
  projectSubtitle: string;
  industry: string;
  serviceType: string;
  image: string;
  intro: string[];
  solution?: string;
  featuresTitle: string;
  features: string[];
  conclusion: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface InsightRecord {
  id: string;
  slug: string;
  category: 'طراحی داشبورد' | 'شاخص‌های KPI' | 'هوش تجاری' | 'تحلیل مالی و فروش';
  title: string;
  excerpt: string;
  content: string;
  statusNote: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  contractModules: string[];
  status: string;
  createdAt: string;
}

export interface UserRecord {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'user' | 'collaborator';
  organizationId: string | null;
  isActive: boolean;
  createdAt: string;
}

export type PortalItemType = 'dashboard' | 'report' | 'session' | 'goal' | 'file';

export interface PortalItemRecord {
  id: number;
  organizationId: string;
  type: PortalItemType;
  title: string;
  description: string;
  urlOrMeta: string;
  status: string;
  dateLabel: string;
  createdAt: string;
}

export interface AnalysisRequestRecord {
  id: number;
  organizationId: string;
  userId: number;
  userName: string;
  title: string;
  description: string;
  priority: 'عادی' | 'مهم' | 'فوری';
  status: string;
  adminResponse: string;
  createdAt: string;
  updatedAt: string;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`binesh_salt_${password}`).digest('hex');
}

export function generateTrackingCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  const suffix = Math.floor(10 + Math.random() * 90);
  return `BN-${num}${suffix}`;
}

// Determine engine: SQLite by default, or MySQL if configured
const useMysql =
  process.env.DB_ENGINE === 'mysql' &&
  Boolean(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE);

let sqliteDb: Database.Database | null = null;
let mysqlPool: mysql.Pool | null = null;

function getSqlite(): Database.Database {
  if (!sqliteDb) {
    const dbFile = process.env.SQLITE_PATH || path.resolve(process.cwd(), 'data', 'binesh.db');
    const dir = path.dirname(dbFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    sqliteDb = new Database(dbFile);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
  }
  return sqliteDb;
}

function getMysql(): mysql.Pool {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4'
    });
  }
  return mysqlPool;
}

export async function initDatabase(): Promise<void> {
  if (useMysql) {
    const pool = getMysql();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS consultation_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tracking_code VARCHAR(32) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        business_name VARCHAR(255) DEFAULT '',
        phone VARCHAR(64) NOT NULL,
        email VARCHAR(255) DEFAULT '',
        service VARCHAR(255) NOT NULL,
        notes TEXT,
        status VARCHAR(32) DEFAULT 'new',
        admin_notes TEXT,
        is_read TINYINT(1) DEFAULT 0,
        notified_sms TINYINT(1) DEFAULT 0,
        notified_email TINYINT(1) DEFAULT 0,
        notification_log TEXT,
        ip_address VARCHAR(64) DEFAULT '',
        created_at VARCHAR(64) NOT NULL,
        updated_at VARCHAR(64) NOT NULL
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS portfolio_items (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        project_subtitle VARCHAR(255) NOT NULL,
        industry VARCHAR(255) NOT NULL,
        service_type VARCHAR(255) NOT NULL,
        image VARCHAR(512) NOT NULL,
        intro_json TEXT NOT NULL,
        solution TEXT,
        features_title VARCHAR(255) NOT NULL,
        features_json TEXT NOT NULL,
        conclusion TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 1,
        is_published TINYINT(1) NOT NULL DEFAULT 1
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS insight_posts (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(255) NOT NULL,
        category VARCHAR(128) NOT NULL,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT,
        status_note VARCHAR(128) NOT NULL,
        sort_order INT NOT NULL DEFAULT 1,
        is_published TINYINT(1) NOT NULL DEFAULT 1
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        setting_key VARCHAR(128) PRIMARY KEY,
        setting_value TEXT NOT NULL
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contract_modules_json TEXT NOT NULL,
        status VARCHAR(64) DEFAULT 'فعال',
        created_at VARCHAR(64) NOT NULL
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(64) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'user',
        organization_id VARCHAR(64) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at VARCHAR(64) NOT NULL
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS portal_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        type VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        url_or_meta TEXT,
        status VARCHAR(64) DEFAULT 'منتشر شده',
        date_label VARCHAR(64) DEFAULT '',
        created_at VARCHAR(64) NOT NULL
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analysis_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(32) DEFAULT 'عادی',
        status VARCHAR(64) DEFAULT 'در انتظار بررسی',
        admin_response TEXT,
        created_at VARCHAR(64) NOT NULL,
        updated_at VARCHAR(64) NOT NULL
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
  } else {
    const db = getSqlite();
    db.exec(`
      CREATE TABLE IF NOT EXISTS consultation_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_code TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        business_name TEXT DEFAULT '',
        phone TEXT NOT NULL,
        email TEXT DEFAULT '',
        service TEXT NOT NULL,
        notes TEXT DEFAULT '',
        status TEXT DEFAULT 'new',
        admin_notes TEXT DEFAULT '',
        is_read INTEGER DEFAULT 0,
        notified_sms INTEGER DEFAULT 0,
        notified_email INTEGER DEFAULT 0,
        notification_log TEXT DEFAULT '',
        ip_address TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS portfolio_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        client_name TEXT NOT NULL,
        project_subtitle TEXT NOT NULL,
        industry TEXT NOT NULL,
        service_type TEXT NOT NULL,
        image TEXT NOT NULL,
        intro_json TEXT NOT NULL,
        solution TEXT DEFAULT '',
        features_title TEXT NOT NULL,
        features_json TEXT NOT NULL,
        conclusion TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 1,
        is_published INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS insight_posts (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT DEFAULT '',
        status_note TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 1,
        is_published INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        contract_modules_json TEXT NOT NULL,
        status TEXT DEFAULT 'فعال',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        organization_id TEXT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS portal_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        url_or_meta TEXT DEFAULT '',
        status TEXT DEFAULT 'منتشر شده',
        date_label TEXT DEFAULT '',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS analysis_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT DEFAULT 'عادی',
        status TEXT DEFAULT 'در انتظار بررسی',
        admin_response TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  await seedInitialData();
}

async function seedInitialData(): Promise<void> {
  const now = new Date().toISOString();

  // 1. Seed Portfolio Items if empty
  const existingPortfolio = await getPortfolioItems(true);
  if (existingPortfolio.length === 0) {
    for (let i = 0; i < PORTFOLIO_PLACEHOLDERS.length; i++) {
      const item = PORTFOLIO_PLACEHOLDERS[i];
      await upsertPortfolioItem({
        id: item.id,
        title: item.title,
        clientName: item.clientName,
        projectSubtitle: item.projectSubtitle,
        industry: item.industry,
        serviceType: item.serviceType,
        image: item.image,
        intro: item.intro,
        solution: item.solution || '',
        featuresTitle: item.featuresTitle,
        features: item.features,
        conclusion: item.conclusion,
        sortOrder: i + 1,
        isPublished: true
      });
    }
  }

  // 2. Seed Insight Posts if empty
  const existingInsights = await getInsightPosts(true);
  if (existingInsights.length === 0) {
    for (let i = 0; i < INSIGHTS_PLACEHOLDERS.length; i++) {
      const post = INSIGHTS_PLACEHOLDERS[i];
      await upsertInsightPost({
        id: post.id,
        slug: post.slug,
        category: post.category,
        title: post.title,
        excerpt: post.excerpt,
        content: post.excerpt,
        statusNote: post.statusNote,
        sortOrder: i + 1,
        isPublished: true
      });
    }
  }

  // 3. Seed Site Settings & Notification Config
  const currentSettings = await getAllSettings();
  const defaultSettings: Record<string, string> = {
    phone: initialContactInfo.phone || '09164006698',
    email: initialContactInfo.email || 'binesh.office@gmail.com',
    address:
      initialContactInfo.address ||
      'شیراز - بلوار مدرس - خیابان آزادگان - کارخانه نوآوری شیراز',
    workingHours:
      initialContactInfo.workingHours ||
      'شنبه تا چهارشنبه از ساعت ۸ تا ۱۷ - پنجشنبه از ساعت ۸ تا ۱۲',
    linkedin: initialContactInfo.linkedin || '',
    telegram: initialContactInfo.telegram || '',
    otherSocial: initialContactInfo.otherSocial || '',
    notifyAdminPhone: process.env.NOTIFY_ADMIN_PHONE || initialContactInfo.phone || '09164006698',
    notifyAdminEmail:
      process.env.NOTIFY_ADMIN_EMAIL || initialContactInfo.email || 'binesh.office@gmail.com',
    soundAlertEnabled: 'true',
    smsEnabled: 'false',
    smsProvider: process.env.SMS_PROVIDER || 'kavenegar',
    kavenegarApiKey: process.env.KAVENEGAR_API_KEY || '',
    kavenegarSender: process.env.KAVENEGAR_SENDER || '',
    kavenegarTemplate: process.env.KAVENEGAR_TEMPLATE || '',
    melipayamakUsername: process.env.MELIPAYAMAK_USERNAME || '',
    melipayamakPassword: process.env.MELIPAYAMAK_PASSWORD || '',
    melipayamakFrom: process.env.MELIPAYAMAK_FROM || '',
    emailEnabled: 'false',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || 'noreply@binesh.ir'
  };

  for (const [k, v] of Object.entries(defaultSettings)) {
    if (currentSettings[k] === undefined) {
      await setSetting(k, v);
    }
  }

  // 4. Seed Default Organizations & Users if empty
  const orgs = await getOrganizations();
  if (orgs.length === 0) {
    await upsertOrganization({
      id: 'org-kabinowood',
      name: 'کابینو وود (سازمان نمونه ۱)',
      contractModules: ['داشبوردهای مدیریتی', 'تحلیل و پایش مستمر', 'مشاوره و کوچینگ'],
      status: 'فعال',
      createdAt: now
    });
    await upsertOrganization({
      id: 'org-paytakht',
      name: 'تجهیزات اداری سرمایه (سازمان نمونه ۲)',
      contractModules: ['داشبوردهای مدیریتی'],
      status: 'فعال',
      createdAt: now
    });
  }

  const allUsers = await getUsers();
  if (allUsers.length === 0) {
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@binesh.ir';
    const adminPhone = process.env.ADMIN_DEFAULT_PHONE || '09164006698';
    const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || 'Binesh@1404';

    await createUser({
      fullName: 'مدیر سیستم بینش',
      phone: adminPhone,
      email: adminEmail,
      passwordHash: hashPassword(adminPass),
      role: 'admin',
      organizationId: 'org-kabinowood',
      isActive: true
    });

    await createUser({
      fullName: 'مدیریت کابینو وود',
      phone: '09120000001',
      email: 'client@kabinowood.ir',
      passwordHash: hashPassword('Client@1404'),
      role: 'manager',
      organizationId: 'org-kabinowood',
      isActive: true
    });

    await createUser({
      fullName: 'مدیریت تجهیزات اداری سرمایه',
      phone: '09120000002',
      email: 'client@paytakht.ir',
      passwordHash: hashPassword('Client@1404'),
      role: 'manager',
      organizationId: 'org-paytakht',
      isActive: true
    });
  }

  // 5. Seed Portal Items for org-kabinowood if empty
  const existingPortalItems = await getPortalItems('org-kabinowood');
  if (existingPortalItems.length === 0) {
    await createPortalItem({
      organizationId: 'org-kabinowood',
      type: 'dashboard',
      title: 'داشبورد مدیریتی و مالی کابینو وود (نسخه وب)',
      description: 'بررسی لحظه‌ای فروش، هزینه‌ها، وضعیت چک‌ها و جریان نقدینگی',
      urlOrMeta: '/demo-webapp.html',
      status: 'منتشر شده',
      dateLabel: 'به‌روزرسانی روزانه'
    });
    await createPortalItem({
      organizationId: 'org-kabinowood',
      type: 'dashboard',
      title: 'گزارش تعاملی کنترل بودجه و بهای تمام‌شده (Power BI)',
      description: 'مقایسه عملکرد واقعی با بودجه مصوب و تحلیل انحراف مراکز هزینه',
      urlOrMeta: '/demo-powerbi.html',
      status: 'منتشر شده',
      dateLabel: 'دوره مالی ۱۴۰۴'
    });
    await createPortalItem({
      organizationId: 'org-kabinowood',
      type: 'report',
      title: 'گزارش تحلیلی عملکرد فروش و حاشیه سود ماهانه',
      description: 'بررسی ترکیب فروش محصولات چوبی، نرخ تحقق هدف و تحلیل نقدینگی چک‌های دریافتی',
      urlOrMeta: 'خلاصه اجرایی مدیریت — ۱۲ صفحه',
      status: 'منتشر شده',
      dateLabel: 'مهر ۱۴۰۴'
    });
    await createPortalItem({
      organizationId: 'org-kabinowood',
      type: 'session',
      title: 'جلسه مرور شاخص‌های کلیدی عملکرد (KPI) و نقدینگی',
      description: 'بررسی علل تغییر حاشیه سود گروه محصولات سفارشی و تعیین سقف اعتباری مشتریان',
      urlOrMeta: 'حضوری / آنلاین — مدت: ۹۰ دقیقه',
      status: 'برنامه‌ریزی شده',
      dateLabel: 'سه‌شنبه ساعت ۱۰:۰۰'
    });
    await createPortalItem({
      organizationId: 'org-kabinowood',
      type: 'goal',
      title: 'کاهش دوره وصول مطالبات چک‌های مشتریان عمده به کمتر از ۴۵ روز',
      description: 'تعریف شاخص هشدار زودهنگام در داشبورد مالی و بازنگری سیاست تخفیف نقدی',
      urlOrMeta: 'مسئول پیگیری: واحد مالی و فروش',
      status: 'در حال بررسی',
      dateLabel: 'فصل پاییز ۱۴۰۴'
    });
    await createPortalItem({
      organizationId: 'org-kabinowood',
      type: 'file',
      title: 'شناسنامه شاخص‌های کلیدی عملکرد (KPI Dictionary) کابینو وود',
      description: 'مستند تعاریف، فرمول‌های محاسبه و منابع داده شاخص‌های داشبورد مدیریتی',
      urlOrMeta: 'فایل مستندات PDF — نسخه ۱.۲',
      status: 'منتشر شده',
      dateLabel: '۱۴۰۴/۰۷/۱۵'
    });
  }
}

// ============================================================================
// REPOSITORY FUNCTIONS (Works identically across SQLite & MySQL)
// ============================================================================

export async function createConsultationRequest(input: {
  fullName: string;
  businessName?: string;
  phone: string;
  email?: string;
  service: string;
  notes?: string;
  ipAddress?: string;
}): Promise<ConsultationRequestRecord> {
  const now = new Date().toISOString();
  const trackingCode = generateTrackingCode();
  const businessName = input.businessName || '';
  const email = input.email || '';
  const notes = input.notes || '';
  const ipAddress = input.ipAddress || '';

  if (useMysql) {
    const pool = getMysql();
    const [res] = await pool.execute<mysql.ResultSetHeader>(
      `INSERT INTO consultation_requests
       (tracking_code, full_name, business_name, phone, email, service, notes, status, admin_notes, is_read, notified_sms, notified_email, notification_log, ip_address, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new', '', 0, 0, 0, '', ?, ?, ?)`,
      [trackingCode, input.fullName, businessName, input.phone, email, input.service, notes, ipAddress, now, now]
    );
    return (await getConsultationById(res.insertId))!;
  } else {
    const db = getSqlite();
    const stmt = db.prepare(`
      INSERT INTO consultation_requests
      (tracking_code, full_name, business_name, phone, email, service, notes, status, admin_notes, is_read, notified_sms, notified_email, notification_log, ip_address, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'new', '', 0, 0, 0, '', ?, ?, ?)
    `);
    const info = stmt.run(
      trackingCode,
      input.fullName,
      businessName,
      input.phone,
      email,
      input.service,
      notes,
      ipAddress,
      now,
      now
    );
    return (await getConsultationById(Number(info.lastInsertRowid)))!;
  }
}

function mapConsultationRow(row: Record<string, unknown>): ConsultationRequestRecord {
  return {
    id: Number(row.id),
    trackingCode: String(row.tracking_code),
    fullName: String(row.full_name),
    businessName: String(row.business_name || ''),
    phone: String(row.phone),
    email: String(row.email || ''),
    service: String(row.service),
    notes: String(row.notes || ''),
    status: (row.status as ConsultationStatus) || 'new',
    adminNotes: String(row.admin_notes || ''),
    isRead: Boolean(row.is_read),
    notifiedSms: Boolean(row.notified_sms),
    notifiedEmail: Boolean(row.notified_email),
    notificationLog: String(row.notification_log || ''),
    ipAddress: String(row.ip_address || ''),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export async function getConsultationById(id: number): Promise<ConsultationRequestRecord | null> {
  if (useMysql) {
    const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
      'SELECT * FROM consultation_requests WHERE id = ?',
      [id]
    );
    return rows[0] ? mapConsultationRow(rows[0]) : null;
  } else {
    const row = getSqlite()
      .prepare('SELECT * FROM consultation_requests WHERE id = ?')
      .get(id) as Record<string, unknown> | undefined;
    return row ? mapConsultationRow(row) : null;
  }
}

export async function getConsultationByTrackingCode(
  code: string
): Promise<ConsultationRequestRecord | null> {
  const normalized = code.trim().toUpperCase();
  if (useMysql) {
    const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
      'SELECT * FROM consultation_requests WHERE UPPER(tracking_code) = ?',
      [normalized]
    );
    return rows[0] ? mapConsultationRow(rows[0]) : null;
  } else {
    const row = getSqlite()
      .prepare('SELECT * FROM consultation_requests WHERE UPPER(tracking_code) = ?')
      .get(normalized) as Record<string, unknown> | undefined;
    return row ? mapConsultationRow(row) : null;
  }
}

export async function getAllConsultations(): Promise<ConsultationRequestRecord[]> {
  if (useMysql) {
    const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
      'SELECT * FROM consultation_requests ORDER BY id DESC'
    );
    return rows.map(mapConsultationRow);
  } else {
    const rows = getSqlite()
      .prepare('SELECT * FROM consultation_requests ORDER BY id DESC')
      .all() as Record<string, unknown>[];
    return rows.map(mapConsultationRow);
  }
}

export async function updateConsultationStatus(
  id: number,
  updates: {
    status?: ConsultationStatus;
    adminNotes?: string;
    isRead?: boolean;
    notifiedSms?: boolean;
    notifiedEmail?: boolean;
    notificationLog?: string;
  }
): Promise<ConsultationRequestRecord | null> {
  const existing = await getConsultationById(id);
  if (!existing) return null;

  const status = updates.status ?? existing.status;
  const adminNotes = updates.adminNotes ?? existing.adminNotes;
  const isRead = updates.isRead !== undefined ? (updates.isRead ? 1 : 0) : existing.isRead ? 1 : 0;
  const notifiedSms =
    updates.notifiedSms !== undefined ? (updates.notifiedSms ? 1 : 0) : existing.notifiedSms ? 1 : 0;
  const notifiedEmail =
    updates.notifiedEmail !== undefined
      ? updates.notifiedEmail
        ? 1
        : 0
      : existing.notifiedEmail
      ? 1
      : 0;
  const notificationLog = updates.notificationLog ?? existing.notificationLog;
  const now = new Date().toISOString();

  if (useMysql) {
    await getMysql().execute(
      `UPDATE consultation_requests
       SET status = ?, admin_notes = ?, is_read = ?, notified_sms = ?, notified_email = ?, notification_log = ?, updated_at = ?
       WHERE id = ?`,
      [status, adminNotes, isRead, notifiedSms, notifiedEmail, notificationLog, now, id]
    );
  } else {
    getSqlite()
      .prepare(
        `UPDATE consultation_requests
         SET status = ?, admin_notes = ?, is_read = ?, notified_sms = ?, notified_email = ?, notification_log = ?, updated_at = ?
         WHERE id = ?`
      )
      .run(status, adminNotes, isRead, notifiedSms, notifiedEmail, notificationLog, now, id);
  }

  return getConsultationById(id);
}

export async function deleteConsultation(id: number): Promise<void> {
  if (useMysql) {
    await getMysql().execute('DELETE FROM consultation_requests WHERE id = ?', [id]);
  } else {
    getSqlite().prepare('DELETE FROM consultation_requests WHERE id = ?').run(id);
  }
}

// ============================================================================
// PORTFOLIO & INSIGHTS REPOSITORY
// ============================================================================

function mapPortfolioRow(row: Record<string, unknown>): PortfolioRecord {
  let intro: string[] = [];
  let features: string[] = [];
  try {
    intro = JSON.parse(String(row.intro_json || '[]'));
  } catch {
    intro = [String(row.intro_json || '')];
  }
  try {
    features = JSON.parse(String(row.features_json || '[]'));
  } catch {
    features = [];
  }
  return {
    id: String(row.id),
    title: String(row.title),
    clientName: String(row.client_name),
    projectSubtitle: String(row.project_subtitle),
    industry: String(row.industry),
    serviceType: String(row.service_type),
    image: String(row.image),
    intro,
    solution: row.solution ? String(row.solution) : undefined,
    featuresTitle: String(row.features_title),
    features,
    conclusion: String(row.conclusion),
    sortOrder: Number(row.sort_order || 1),
    isPublished: Boolean(row.is_published)
  };
}

export async function getPortfolioItems(includeUnpublished = false): Promise<PortfolioRecord[]> {
  const query = includeUnpublished
    ? 'SELECT * FROM portfolio_items ORDER BY sort_order ASC, id ASC'
    : 'SELECT * FROM portfolio_items WHERE is_published = 1 ORDER BY sort_order ASC, id ASC';

  if (useMysql) {
    const [rows] = await getMysql().query<mysql.RowDataPacket[]>(query);
    return rows.map(mapPortfolioRow);
  } else {
    const rows = getSqlite().prepare(query).all() as Record<string, unknown>[];
    return rows.map(mapPortfolioRow);
  }
}

export async function upsertPortfolioItem(item: PortfolioRecord): Promise<void> {
  const introJson = JSON.stringify(item.intro || []);
  const featuresJson = JSON.stringify(item.features || []);
  const isPub = item.isPublished ? 1 : 0;

  if (useMysql) {
    await getMysql().execute(
      `INSERT INTO portfolio_items
       (id, title, client_name, project_subtitle, industry, service_type, image, intro_json, solution, features_title, features_json, conclusion, sort_order, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       title = VALUES(title), client_name = VALUES(client_name), project_subtitle = VALUES(project_subtitle),
       industry = VALUES(industry), service_type = VALUES(service_type), image = VALUES(image),
       intro_json = VALUES(intro_json), solution = VALUES(solution), features_title = VALUES(features_title),
       features_json = VALUES(features_json), conclusion = VALUES(conclusion), sort_order = VALUES(sort_order), is_published = VALUES(is_published)`,
      [
        item.id,
        item.title,
        item.clientName,
        item.projectSubtitle,
        item.industry,
        item.serviceType,
        item.image,
        introJson,
        item.solution || '',
        item.featuresTitle,
        featuresJson,
        item.conclusion,
        item.sortOrder,
        isPub
      ]
    );
  } else {
    getSqlite()
      .prepare(
        `INSERT INTO portfolio_items
         (id, title, client_name, project_subtitle, industry, service_type, image, intro_json, solution, features_title, features_json, conclusion, sort_order, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
         title = excluded.title, client_name = excluded.client_name, project_subtitle = excluded.project_subtitle,
         industry = excluded.industry, service_type = excluded.service_type, image = excluded.image,
         intro_json = excluded.intro_json, solution = excluded.solution, features_title = excluded.features_title,
         features_json = excluded.features_json, conclusion = excluded.conclusion, sort_order = excluded.sort_order, is_published = excluded.is_published`
      )
      .run(
        item.id,
        item.title,
        item.clientName,
        item.projectSubtitle,
        item.industry,
        item.serviceType,
        item.image,
        introJson,
        item.solution || '',
        item.featuresTitle,
        featuresJson,
        item.conclusion,
        item.sortOrder,
        isPub
      );
  }
}

export async function deletePortfolioItem(id: string): Promise<void> {
  if (useMysql) {
    await getMysql().execute('DELETE FROM portfolio_items WHERE id = ?', [id]);
  } else {
    getSqlite().prepare('DELETE FROM portfolio_items WHERE id = ?').run(id);
  }
}

function mapInsightRow(row: Record<string, unknown>): InsightRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    category: String(row.category) as InsightRecord['category'],
    title: String(row.title),
    excerpt: String(row.excerpt),
    content: String(row.content || row.excerpt || ''),
    statusNote: String(row.status_note),
    sortOrder: Number(row.sort_order || 1),
    isPublished: Boolean(row.is_published)
  };
}

export async function getInsightPosts(includeUnpublished = false): Promise<InsightRecord[]> {
  const query = includeUnpublished
    ? 'SELECT * FROM insight_posts ORDER BY sort_order ASC, id ASC'
    : 'SELECT * FROM insight_posts WHERE is_published = 1 ORDER BY sort_order ASC, id ASC';

  if (useMysql) {
    const [rows] = await getMysql().query<mysql.RowDataPacket[]>(query);
    return rows.map(mapInsightRow);
  } else {
    const rows = getSqlite().prepare(query).all() as Record<string, unknown>[];
    return rows.map(mapInsightRow);
  }
}

export async function upsertInsightPost(post: InsightRecord): Promise<void> {
  const isPub = post.isPublished ? 1 : 0;
  if (useMysql) {
    await getMysql().execute(
      `INSERT INTO insight_posts
       (id, slug, category, title, excerpt, content, status_note, sort_order, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       slug = VALUES(slug), category = VALUES(category), title = VALUES(title),
       excerpt = VALUES(excerpt), content = VALUES(content), status_note = VALUES(status_note),
       sort_order = VALUES(sort_order), is_published = VALUES(is_published)`,
      [
        post.id,
        post.slug,
        post.category,
        post.title,
        post.excerpt,
        post.content || '',
        post.statusNote,
        post.sortOrder,
        isPub
      ]
    );
  } else {
    getSqlite()
      .prepare(
        `INSERT INTO insight_posts
         (id, slug, category, title, excerpt, content, status_note, sort_order, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
         slug = excluded.slug, category = excluded.category, title = excluded.title,
         excerpt = excluded.excerpt, content = excluded.content, status_note = excluded.status_note,
         sort_order = excluded.sort_order, is_published = excluded.is_published`
      )
      .run(
        post.id,
        post.slug,
        post.category,
        post.title,
        post.excerpt,
        post.content || '',
        post.statusNote,
        post.sortOrder,
        isPub
      );
  }
}

export async function deleteInsightPost(id: string): Promise<void> {
  if (useMysql) {
    await getMysql().execute('DELETE FROM insight_posts WHERE id = ?', [id]);
  } else {
    getSqlite().prepare('DELETE FROM insight_posts WHERE id = ?').run(id);
  }
}

// ============================================================================
// SITE SETTINGS & CONTACT INFO
// ============================================================================

export async function getAllSettings(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  if (useMysql) {
    const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
      'SELECT setting_key, setting_value FROM site_settings'
    );
    for (const r of rows) {
      result[String(r.setting_key)] = String(r.setting_value);
    }
  } else {
    const rows = getSqlite()
      .prepare('SELECT setting_key, setting_value FROM site_settings')
      .all() as { setting_key: string; setting_value: string }[];
    for (const r of rows) {
      result[r.setting_key] = r.setting_value;
    }
  }
  return result;
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (useMysql) {
    await getMysql().execute(
      `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, value]
    );
  } else {
    getSqlite()
      .prepare(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
         ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value`
      )
      .run(key, value);
  }
}

// ============================================================================
// USERS, ORGANIZATIONS & CLIENT PORTAL REPOSITORY
// ============================================================================

function mapOrgRow(row: Record<string, unknown>): OrganizationRecord {
  let modules: string[] = [];
  try {
    modules = JSON.parse(String(row.contract_modules_json || '[]'));
  } catch {
    modules = [];
  }
  return {
    id: String(row.id),
    name: String(row.name),
    contractModules: modules,
    status: String(row.status || 'فعال'),
    createdAt: String(row.created_at)
  };
}

export async function getOrganizations(): Promise<OrganizationRecord[]> {
  if (useMysql) {
    const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
      'SELECT * FROM organizations ORDER BY created_at ASC'
    );
    return rows.map(mapOrgRow);
  } else {
    const rows = getSqlite()
      .prepare('SELECT * FROM organizations ORDER BY created_at ASC')
      .all() as Record<string, unknown>[];
    return rows.map(mapOrgRow);
  }
}

export async function upsertOrganization(org: OrganizationRecord): Promise<void> {
  const modulesJson = JSON.stringify(org.contractModules || []);
  const now = org.createdAt || new Date().toISOString();
  if (useMysql) {
    await getMysql().execute(
      `INSERT INTO organizations (id, name, contract_modules_json, status, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), contract_modules_json = VALUES(contract_modules_json), status = VALUES(status)`,
      [org.id, org.name, modulesJson, org.status, now]
    );
  } else {
    getSqlite()
      .prepare(
        `INSERT INTO organizations (id, name, contract_modules_json, status, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, contract_modules_json = excluded.contract_modules_json, status = excluded.status`
      )
      .run(org.id, org.name, modulesJson, org.status, now);
  }
}

function mapUserRow(row: Record<string, unknown>): UserRecord {
  return {
    id: Number(row.id),
    fullName: String(row.full_name),
    phone: String(row.phone),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    role: (row.role as UserRecord['role']) || 'user',
    organizationId: row.organization_id ? String(row.organization_id) : null,
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at)
  };
}

export async function getUsers(): Promise<UserRecord[]> {
  if (useMysql) {
    const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
      'SELECT * FROM users ORDER BY id ASC'
    );
    return rows.map(mapUserRow);
  } else {
    const rows = getSqlite().prepare('SELECT * FROM users ORDER BY id ASC').all() as Record<
      string,
      unknown
    >[];
    return rows.map(mapUserRow);
  }
}

export async function findUserByIdentifier(identifier: string): Promise<UserRecord | null> {
  const clean = identifier.trim().toLowerCase();
  if (useMysql) {
    const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
      'SELECT * FROM users WHERE LOWER(email) = ? OR phone = ? LIMIT 1',
      [clean, clean]
    );
    return rows[0] ? mapUserRow(rows[0]) : null;
  } else {
    const row = getSqlite()
      .prepare('SELECT * FROM users WHERE LOWER(email) = ? OR phone = ? LIMIT 1')
      .get(clean, clean) as Record<string, unknown> | undefined;
    return row ? mapUserRow(row) : null;
  }
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  if (useMysql) {
    const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ? mapUserRow(rows[0]) : null;
  } else {
    const row = getSqlite()
      .prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
      .get(id) as Record<string, unknown> | undefined;
    return row ? mapUserRow(row) : null;
  }
}

export async function createUser(input: {
  fullName: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: UserRecord['role'];
  organizationId: string | null;
  isActive?: boolean;
}): Promise<UserRecord> {
  const now = new Date().toISOString();
  const isActive = input.isActive !== false ? 1 : 0;
  if (useMysql) {
    const [res] = await getMysql().execute<mysql.ResultSetHeader>(
      `INSERT INTO users (full_name, phone, email, password_hash, role, organization_id, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.fullName,
        input.phone.trim(),
        input.email.trim().toLowerCase(),
        input.passwordHash,
        input.role,
        input.organizationId,
        isActive,
        now
      ]
    );
    return (await findUserById(res.insertId))!;
  } else {
    const info = getSqlite()
      .prepare(
        `INSERT INTO users (full_name, phone, email, password_hash, role, organization_id, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.fullName,
        input.phone.trim(),
        input.email.trim().toLowerCase(),
        input.passwordHash,
        input.role,
        input.organizationId,
        isActive,
        now
      );
    return (await findUserById(Number(info.lastInsertRowid)))!;
  }
}

export async function updateUser(
  id: number,
  updates: {
    fullName?: string;
    role?: UserRecord['role'];
    organizationId?: string | null;
    passwordHash?: string;
    isActive?: boolean;
  }
): Promise<UserRecord | null> {
  const existing = await findUserById(id);
  if (!existing) return null;

  const fullName = updates.fullName ?? existing.fullName;
  const role = updates.role ?? existing.role;
  const organizationId =
    updates.organizationId !== undefined ? updates.organizationId : existing.organizationId;
  const passwordHash = updates.passwordHash ?? existing.passwordHash;
  const isActive =
    updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : existing.isActive ? 1 : 0;

  if (useMysql) {
    await getMysql().execute(
      `UPDATE users SET full_name = ?, role = ?, organization_id = ?, password_hash = ?, is_active = ? WHERE id = ?`,
      [fullName, role, organizationId, passwordHash, isActive, id]
    );
  } else {
    getSqlite()
      .prepare(
        `UPDATE users SET full_name = ?, role = ?, organization_id = ?, password_hash = ?, is_active = ? WHERE id = ?`
      )
      .run(fullName, role, organizationId, passwordHash, isActive, id);
  }
  return findUserById(id);
}

function mapPortalItemRow(row: Record<string, unknown>): PortalItemRecord {
  return {
    id: Number(row.id),
    organizationId: String(row.organization_id),
    type: String(row.type) as PortalItemType,
    title: String(row.title),
    description: String(row.description || ''),
    urlOrMeta: String(row.url_or_meta || ''),
    status: String(row.status || 'منتشر شده'),
    dateLabel: String(row.date_label || ''),
    createdAt: String(row.created_at)
  };
}

export async function getPortalItems(organizationId?: string): Promise<PortalItemRecord[]> {
  if (useMysql) {
    if (organizationId) {
      const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
        'SELECT * FROM portal_items WHERE organization_id = ? ORDER BY id DESC',
        [organizationId]
      );
      return rows.map(mapPortalItemRow);
    } else {
      const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
        'SELECT * FROM portal_items ORDER BY id DESC'
      );
      return rows.map(mapPortalItemRow);
    }
  } else {
    if (organizationId) {
      const rows = getSqlite()
        .prepare('SELECT * FROM portal_items WHERE organization_id = ? ORDER BY id DESC')
        .all(organizationId) as Record<string, unknown>[];
      return rows.map(mapPortalItemRow);
    } else {
      const rows = getSqlite()
        .prepare('SELECT * FROM portal_items ORDER BY id DESC')
        .all() as Record<string, unknown>[];
      return rows.map(mapPortalItemRow);
    }
  }
}

export async function createPortalItem(input: {
  organizationId: string;
  type: PortalItemType;
  title: string;
  description: string;
  urlOrMeta: string;
  status: string;
  dateLabel: string;
}): Promise<void> {
  const now = new Date().toISOString();
  if (useMysql) {
    await getMysql().execute(
      `INSERT INTO portal_items (organization_id, type, title, description, url_or_meta, status, date_label, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.organizationId,
        input.type,
        input.title,
        input.description,
        input.urlOrMeta,
        input.status,
        input.dateLabel,
        now
      ]
    );
  } else {
    getSqlite()
      .prepare(
        `INSERT INTO portal_items (organization_id, type, title, description, url_or_meta, status, date_label, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.organizationId,
        input.type,
        input.title,
        input.description,
        input.urlOrMeta,
        input.status,
        input.dateLabel,
        now
      );
  }
}

export async function deletePortalItem(id: number): Promise<void> {
  if (useMysql) {
    await getMysql().execute('DELETE FROM portal_items WHERE id = ?', [id]);
  } else {
    getSqlite().prepare('DELETE FROM portal_items WHERE id = ?').run(id);
  }
}

function mapAnalysisRequestRow(row: Record<string, unknown>): AnalysisRequestRecord {
  return {
    id: Number(row.id),
    organizationId: String(row.organization_id),
    userId: Number(row.user_id),
    userName: String(row.user_name),
    title: String(row.title),
    description: String(row.description),
    priority: (row.priority as AnalysisRequestRecord['priority']) || 'عادی',
    status: String(row.status || 'در انتظار بررسی'),
    adminResponse: String(row.admin_response || ''),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export async function getAnalysisRequests(organizationId?: string): Promise<AnalysisRequestRecord[]> {
  if (useMysql) {
    if (organizationId) {
      const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
        'SELECT * FROM analysis_requests WHERE organization_id = ? ORDER BY id DESC',
        [organizationId]
      );
      return rows.map(mapAnalysisRequestRow);
    } else {
      const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
        'SELECT * FROM analysis_requests ORDER BY id DESC'
      );
      return rows.map(mapAnalysisRequestRow);
    }
  } else {
    if (organizationId) {
      const rows = getSqlite()
        .prepare('SELECT * FROM analysis_requests WHERE organization_id = ? ORDER BY id DESC')
        .all(organizationId) as Record<string, unknown>[];
      return rows.map(mapAnalysisRequestRow);
    } else {
      const rows = getSqlite()
        .prepare('SELECT * FROM analysis_requests ORDER BY id DESC')
        .all() as Record<string, unknown>[];
      return rows.map(mapAnalysisRequestRow);
    }
  }
}

export async function createAnalysisRequest(input: {
  organizationId: string;
  userId: number;
  userName: string;
  title: string;
  description: string;
  priority: AnalysisRequestRecord['priority'];
}): Promise<AnalysisRequestRecord> {
  const now = new Date().toISOString();
  if (useMysql) {
    const [res] = await getMysql().execute<mysql.ResultSetHeader>(
      `INSERT INTO analysis_requests (organization_id, user_id, user_name, title, description, priority, status, admin_response, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'در انتظار بررسی', '', ?, ?)`,
      [input.organizationId, input.userId, input.userName, input.title, input.description, input.priority, now, now]
    );
    const [rows] = await getMysql().query<mysql.RowDataPacket[]>(
      'SELECT * FROM analysis_requests WHERE id = ?',
      [res.insertId]
    );
    return mapAnalysisRequestRow(rows[0]);
  } else {
    const info = getSqlite()
      .prepare(
        `INSERT INTO analysis_requests (organization_id, user_id, user_name, title, description, priority, status, admin_response, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'در انتظار بررسی', '', ?, ?)`
      )
      .run(
        input.organizationId,
        input.userId,
        input.userName,
        input.title,
        input.description,
        input.priority,
        now,
        now
      );
    const row = getSqlite()
      .prepare('SELECT * FROM analysis_requests WHERE id = ?')
      .get(Number(info.lastInsertRowid)) as Record<string, unknown>;
    return mapAnalysisRequestRow(row);
  }
}

export async function updateAnalysisRequest(
  id: number,
  updates: { status: string; adminResponse: string }
): Promise<void> {
  const now = new Date().toISOString();
  if (useMysql) {
    await getMysql().execute(
      'UPDATE analysis_requests SET status = ?, admin_response = ?, updated_at = ? WHERE id = ?',
      [updates.status, updates.adminResponse, now, id]
    );
  } else {
    getSqlite()
      .prepare(
        'UPDATE analysis_requests SET status = ?, admin_response = ?, updated_at = ? WHERE id = ?'
      )
      .run(updates.status, updates.adminResponse, now, id);
  }
}
