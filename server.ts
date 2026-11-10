import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import * as dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import {
  initDatabase,
  createConsultationRequest,
  getConsultationByTrackingCode,
  getAllConsultations,
  updateConsultationStatus,
  deleteConsultation,
  getPortfolioItems,
  upsertPortfolioItem,
  deletePortfolioItem,
  getInsightPosts,
  upsertInsightPost,
  deleteInsightPost,
  getAllSettings,
  setSetting,
  getOrganizations,
  upsertOrganization,
  getUsers,
  findUserByIdentifier,
  findUserById,
  createUser,
  updateUser,
  getPortalItems,
  createPortalItem,
  deletePortalItem,
  getAnalysisRequests,
  createAnalysisRequest,
  updateAnalysisRequest,
  hashPassword,
  ConsultationStatus,
  UserRecord
} from './src/server/db.ts';
import { dispatchNewConsultationNotifications } from './src/server/notifications.ts';

dotenv.config();

const PORT = 3000;
const AUTH_SECRET = process.env.AUTH_SECRET || 'binesh-secret-token-key-2026';

// ============================================================================
// LIGHTWEIGHT SIGNED TOKEN (HMAC-SHA256)
// ============================================================================
interface TokenPayload {
  uid: number;
  role: string;
  exp: number;
}

function signToken(user: UserRecord): string {
  const payload: TokenPayload = {
    uid: user.id,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as TokenPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

interface AuthenticatedRequest extends Request {
  currentUser?: UserRecord;
}

async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'برای دسترسی به این بخش، لطفاً وارد حساب کاربری خود شوید.' });
      return;
    }
    const token = authHeader.slice(7).trim();
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'نشست کاربری شما منقضی شده است. لطفاً دوباره وارد شوید.' });
      return;
    }
    const user = await findUserById(decoded.uid);
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'حساب کاربری معتبر نیست یا غیرفعال شده است.' });
      return;
    }
    req.currentUser = user;
    next();
  } catch {
    res.status(401).json({ error: 'خطا در بررسی اعتبار نشست کاربری.' });
  }
}

async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  await requireAuth(req, res, async () => {
    if (req.currentUser?.role !== 'admin') {
      res.status(403).json({ error: 'دسترسی محدود به مدیر سیستم است.' });
      return;
    }
    next();
  });
}

// ============================================================================
// ANTI-SPAM RATE LIMITER FOR CONSULTATION FORM
// ============================================================================
const submissionRateMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 8;

function checkConsultationRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionRateMap.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    submissionRateMap.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  submissionRateMap.set(ip, timestamps);
  return true;
}

const STATUS_PERSIAN_LABELS: Record<ConsultationStatus, string> = {
  new: 'ثبت شده — در انتظار بررسی کارشناس',
  contacted: 'تماس اولیه برقرار شد',
  in_progress: 'در حال بررسی تحلیلی و تنظیم جلسه',
  converted: 'هماهنگ شده / آغاز همکاری',
  archived: 'بایگانی شده'
};

async function startServer() {
  await initDatabase();

  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // ==========================================================================
  // 1. PUBLIC BOOTSTRAP API (Portfolio, Insights, Contact Info)
  // ==========================================================================
  app.get('/api/public/bootstrap', async (_req, res) => {
    try {
      const [portfolio, insights, settings] = await Promise.all([
        getPortfolioItems(false),
        getInsightPosts(false),
        getAllSettings()
      ]);

      res.json({
        ok: true,
        portfolio,
        insights,
        contactInfo: {
          phone: settings.phone || null,
          email: settings.email || null,
          address: settings.address || null,
          workingHours: settings.workingHours || null,
          linkedin: settings.linkedin || null,
          telegram: settings.telegram || null,
          otherSocial: settings.otherSocial || null
        }
      });
    } catch (error) {
      console.error('Bootstrap error:', error);
      res.status(500).json({ ok: false, error: 'خطا در دریافت اطلاعات پایه سایت' });
    }
  });

  // ==========================================================================
  // 2. CONSULTATION REQUEST SUBMISSION & TRACKING
  // ==========================================================================
  app.post('/api/consultations', async (req, res) => {
    try {
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown';

      if (!checkConsultationRateLimit(ip)) {
        res.status(429).json({
          ok: false,
          error: 'تعداد درخواست‌های ارسالی بیش از حد مجاز است. لطفاً چند دقیقه دیگر تلاش کنید.'
        });
        return;
      }

      const { fullName, businessName, phone, email, service, notes } = req.body || {};
      const cleanName = String(fullName || '').trim();
      const cleanPhone = String(phone || '').trim();
      const cleanService = String(service || 'داشبوردهای مدیریتی').trim();

      if (!cleanName || cleanName.length < 2) {
        res.status(400).json({ ok: false, error: 'لطفاً نام و نام خانوادگی خود را وارد کنید.' });
        return;
      }
      if (!cleanPhone || cleanPhone.length < 7) {
        res.status(400).json({ ok: false, error: 'لطفاً شماره تماس معتبر وارد کنید.' });
        return;
      }

      const record = await createConsultationRequest({
        fullName: cleanName,
        businessName: String(businessName || '').trim(),
        phone: cleanPhone,
        email: String(email || '').trim(),
        service: cleanService,
        notes: String(notes || '').trim(),
        ipAddress: ip
      });

      // Fire notifications asynchronously so user gets immediate response
      dispatchNewConsultationNotifications(record).catch((err) => {
        console.error('Notification dispatch error:', err);
      });

      res.status(201).json({
        ok: true,
        trackingCode: record.trackingCode,
        createdAt: record.createdAt
      });
    } catch (error) {
      console.error('Error saving consultation request:', error);
      res.status(500).json({
        ok: false,
        error: 'خطا در ثبت درخواست مشاوره. لطفاً دوباره تلاش کنید.'
      });
    }
  });

  app.get('/api/consultations/track/:code', async (req, res) => {
    try {
      const code = String(req.params.code || '').trim();
      if (!code) {
        res.status(400).json({ ok: false, error: 'کد رهگیری وارد نشده است.' });
        return;
      }
      const record = await getConsultationByTrackingCode(code);
      if (!record) {
        res.status(404).json({
          ok: false,
          error: 'درخواستی با این کد رهگیری یافت نشد. لطفاً کد را بررسی کنید.'
        });
        return;
      }
      res.json({
        ok: true,
        request: {
          trackingCode: record.trackingCode,
          fullName: record.fullName,
          businessName: record.businessName,
          service: record.service,
          status: record.status,
          statusLabel: STATUS_PERSIAN_LABELS[record.status] || 'در حال بررسی',
          createdAt: record.createdAt,
          updatedAt: record.updatedAt
        }
      });
    } catch (error) {
      console.error('Error tracking consultation:', error);
      res.status(500).json({ ok: false, error: 'خطا در استعلام کد رهگیری' });
    }
  });

  // ==========================================================================
  // 3. AUTHENTICATION API (/api/auth/*)
  // ==========================================================================
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { identifier, password } = req.body || {};
      if (!identifier || !password) {
        res.status(400).json({
          ok: false,
          error: 'اطلاعات ورود صحیح نیست. لطفاً دوباره بررسی کنید.'
        });
        return;
      }

      const user = await findUserByIdentifier(String(identifier));
      if (!user) {
        res.status(401).json({
          ok: false,
          error: 'حسابی با این مشخصات پیدا نشد.'
        });
        return;
      }

      if (user.passwordHash !== hashPassword(String(password))) {
        res.status(401).json({
          ok: false,
          error: 'اطلاعات ورود صحیح نیست. لطفاً دوباره بررسی کنید.'
        });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({
          ok: false,
          error: 'برای ادامه، ابتدا حساب خود را تأیید کنید.'
        });
        return;
      }

      const token = signToken(user);
      const orgs = await getOrganizations();
      const org = orgs.find((o) => o.id === user.organizationId) || null;

      res.json({
        ok: true,
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId
        },
        organization: org
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ ok: false, error: 'خطا در ورود به سیستم' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { fullName, phone, email, password } = req.body || {};
      const cleanName = String(fullName || '').trim();
      const cleanPhone = String(phone || '').trim();
      const cleanEmail = String(email || `${cleanPhone}@user.binesh.ir`).trim().toLowerCase();
      const cleanPass = String(password || '');

      if (!cleanName || !cleanPhone || cleanPass.length < 4) {
        res.status(400).json({
          ok: false,
          error: 'لطفاً اطلاعات خواسته‌شده را به درستی وارد کنید.'
        });
        return;
      }

      const existingPhone = await findUserByIdentifier(cleanPhone);
      const existingEmail = await findUserByIdentifier(cleanEmail);
      if (existingPhone || existingEmail) {
        res.status(409).json({
          ok: false,
          error: 'این ایمیل یا شماره همراه قبلاً ثبت شده است.'
        });
        return;
      }

      const newUser = await createUser({
        fullName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash: hashPassword(cleanPass),
        role: 'user',
        organizationId: 'org-kabinowood',
        isActive: true
      });

      const token = signToken(newUser);
      res.status(201).json({
        ok: true,
        token,
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
          organizationId: newUser.organizationId
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ ok: false, error: 'خطا در ایجاد حساب کاربری' });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
    const user = req.currentUser!;
    const orgs = await getOrganizations();
    const org = orgs.find((o) => o.id === user.organizationId) || null;
    res.json({
      ok: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      },
      organization: org
    });
  });

  // ==========================================================================
  // 4. CLIENT PORTAL API (/api/portal/*)
  // ==========================================================================
  app.get('/api/portal/data', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.currentUser!;
      const orgs = await getOrganizations();
      const requestedOrgId = String(req.query.orgId || '').trim();
      const targetOrgId =
        user.role === 'admin' && requestedOrgId
          ? requestedOrgId
          : user.organizationId || orgs[0]?.id || 'org-kabinowood';

      const organization = orgs.find((o) => o.id === targetOrgId) || orgs[0] || null;
      const [items, requests] = await Promise.all([
        getPortalItems(targetOrgId),
        getAnalysisRequests(targetOrgId)
      ]);

      res.json({
        ok: true,
        organization,
        organizations: user.role === 'admin' ? orgs : orgs.filter((o) => o.id === targetOrgId),
        portalItems: items,
        analysisRequests: requests
      });
    } catch (error) {
      console.error('Portal data error:', error);
      res.status(500).json({ ok: false, error: 'خطا در بارگذاری اطلاعات پورتال' });
    }
  });

  app.post('/api/portal/requests', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.currentUser!;
      const { title, description, priority, organizationId } = req.body || {};
      const cleanTitle = String(title || '').trim();
      const cleanDesc = String(description || '').trim();
      if (!cleanTitle || !cleanDesc) {
        res.status(400).json({ ok: false, error: 'عنوان و شرح درخواست تحلیلی الزامی است.' });
        return;
      }
      const targetOrgId =
        user.role === 'admin' && organizationId
          ? String(organizationId)
          : user.organizationId || 'org-kabinowood';

      const created = await createAnalysisRequest({
        organizationId: targetOrgId,
        userId: user.id,
        userName: user.fullName,
        title: cleanTitle,
        description: cleanDesc,
        priority: priority === 'فوری' || priority === 'مهم' ? priority : 'عادی'
      });

      res.status(201).json({ ok: true, request: created });
    } catch (error) {
      console.error('Create analysis request error:', error);
      res.status(500).json({ ok: false, error: 'خطا در ثبت درخواست تحلیل' });
    }
  });

  // ==========================================================================
  // 5. ADMIN PANEL API (/api/admin/*)
  // ==========================================================================
  app.get('/api/admin/poll', requireAdmin, async (_req, res) => {
    try {
      const consultations = await getAllConsultations();
      const unread = consultations.filter((c) => !c.isRead);
      res.json({
        ok: true,
        unreadCount: unread.length,
        totalCount: consultations.length,
        latestRequest: consultations[0] || null
      });
    } catch {
      res.status(500).json({ ok: false });
    }
  });

  app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
    try {
      const [
        consultations,
        portfolio,
        insights,
        settings,
        organizations,
        users,
        portalItems,
        analysisRequests
      ] = await Promise.all([
        getAllConsultations(),
        getPortfolioItems(true),
        getInsightPosts(true),
        getAllSettings(),
        getOrganizations(),
        getUsers(),
        getPortalItems(),
        getAnalysisRequests()
      ]);

      res.json({
        ok: true,
        consultations,
        unreadCount: consultations.filter((c) => !c.isRead).length,
        portfolio,
        insights,
        settings,
        organizations,
        users: users.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          phone: u.phone,
          email: u.email,
          role: u.role,
          organizationId: u.organizationId,
          isActive: u.isActive,
          createdAt: u.createdAt
        })),
        portalItems,
        analysisRequests
      });
    } catch (error) {
      console.error('Admin overview error:', error);
      res.status(500).json({ ok: false, error: 'خطا در بارگذاری اطلاعات پنل مدیریت' });
    }
  });

  app.patch('/api/admin/consultations/:id', requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status, adminNotes, isRead } = req.body || {};
      const updated = await updateConsultationStatus(id, {
        status,
        adminNotes,
        isRead
      });
      res.json({ ok: true, consultation: updated });
    } catch (error) {
      console.error('Update consultation error:', error);
      res.status(500).json({ ok: false, error: 'خطا در به‌روزرسانی درخواست مشاوره' });
    }
  });

  app.delete('/api/admin/consultations/:id', requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await deleteConsultation(id);
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete consultation error:', error);
      res.status(500).json({ ok: false, error: 'خطا در حذف درخواست مشاوره' });
    }
  });

  app.get('/api/admin/consultations/export.csv', requireAdmin, async (_req, res) => {
    try {
      const list = await getAllConsultations();
      const headers = [
        'شناسه',
        'کد رهگیری',
        'نام و نام خانوادگی',
        'نام کسب‌وکار',
        'شماره تماس',
        'ایمیل',
        'خدمت درخواستی',
        'وضعیت',
        'توضیحات مشتری',
        'یادداشت مدیر',
        'زمان ثبت'
      ];
      const escapeCsv = (val: string | number) => {
        const str = String(val ?? '').replace(/"/g, '""');
        return `"${str}"`;
      };
      const rows = list.map((r) =>
        [
          r.id,
          r.trackingCode,
          r.fullName,
          r.businessName,
          r.phone,
          r.email,
          r.service,
          STATUS_PERSIAN_LABELS[r.status] || r.status,
          r.notes,
          r.adminNotes,
          r.createdAt
        ]
          .map(escapeCsv)
          .join(',')
      );

      // Include UTF-8 BOM (\uFEFF) so Excel opens Persian characters cleanly
      const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="binesh-consultations-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(csvContent);
    } catch (error) {
      console.error('Export CSV error:', error);
      res.status(500).json({ ok: false, error: 'خطا در تولید فایل اکسل/CSV' });
    }
  });

  // Portfolio CRUD
  app.post('/api/admin/portfolio', requireAdmin, async (req, res) => {
    try {
      const body = req.body || {};
      const id = String(body.id || `proj-${Date.now()}`).trim();
      await upsertPortfolioItem({
        id,
        title: String(body.title || '').trim(),
        clientName: String(body.clientName || '').trim(),
        projectSubtitle: String(body.projectSubtitle || '').trim(),
        industry: String(body.industry || '').trim(),
        serviceType: String(body.serviceType || '').trim(),
        image: String(body.image || '/assets/aistudio/Kabinowood_9a6089ec.png').trim(),
        intro: Array.isArray(body.intro)
          ? body.intro
          : String(body.intro || '')
              .split('\n')
              .map((s: string) => s.trim())
              .filter(Boolean),
        solution: String(body.solution || '').trim(),
        featuresTitle: String(body.featuresTitle || 'امکانات').trim(),
        features: Array.isArray(body.features)
          ? body.features
          : String(body.features || '')
              .split('\n')
              .map((s: string) => s.trim())
              .filter(Boolean),
        conclusion: String(body.conclusion || '').trim(),
        sortOrder: Number(body.sortOrder || 1),
        isPublished: body.isPublished !== false
      });
      const updated = await getPortfolioItems(true);
      res.json({ ok: true, portfolio: updated });
    } catch (error) {
      console.error('Upsert portfolio error:', error);
      res.status(500).json({ ok: false, error: 'خطا در ذخیره نمونه‌کار' });
    }
  });

  app.delete('/api/admin/portfolio/:id', requireAdmin, async (req, res) => {
    try {
      await deletePortfolioItem(String(req.params.id));
      const updated = await getPortfolioItems(true);
      res.json({ ok: true, portfolio: updated });
    } catch (error) {
      console.error('Delete portfolio error:', error);
      res.status(500).json({ ok: false, error: 'خطا در حذف نمونه‌کار' });
    }
  });

  // Insights CRUD
  app.post('/api/admin/insights', requireAdmin, async (req, res) => {
    try {
      const body = req.body || {};
      const id = String(body.id || `ins-${Date.now()}`).trim();
      await upsertInsightPost({
        id,
        slug: String(body.slug || id).trim(),
        category: body.category || 'هوش تجاری',
        title: String(body.title || '').trim(),
        excerpt: String(body.excerpt || '').trim(),
        content: String(body.content || body.excerpt || '').trim(),
        statusNote: String(body.statusNote || 'منتشر شده').trim(),
        sortOrder: Number(body.sortOrder || 1),
        isPublished: body.isPublished !== false
      });
      const updated = await getInsightPosts(true);
      res.json({ ok: true, insights: updated });
    } catch (error) {
      console.error('Upsert insight error:', error);
      res.status(500).json({ ok: false, error: 'خطا در ذخیره مطلب بینش‌نامه' });
    }
  });

  app.delete('/api/admin/insights/:id', requireAdmin, async (req, res) => {
    try {
      await deleteInsightPost(String(req.params.id));
      const updated = await getInsightPosts(true);
      res.json({ ok: true, insights: updated });
    } catch (error) {
      console.error('Delete insight error:', error);
      res.status(500).json({ ok: false, error: 'خطا در حذف مطلب بینش‌نامه' });
    }
  });

  // Settings & Contact Info Update
  app.put('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const updates = req.body || {};
      for (const [k, v] of Object.entries(updates)) {
        if (typeof v === 'string') {
          await setSetting(k, v);
        }
      }
      const settings = await getAllSettings();
      res.json({ ok: true, settings });
    } catch (error) {
      console.error('Settings update error:', error);
      res.status(500).json({ ok: false, error: 'خطا در ذخیره تنظیمات' });
    }
  });

  // Test Notification Trigger
  app.post('/api/admin/test-notification', requireAdmin, async (_req, res) => {
    try {
      const dummyRecord = {
        id: 0,
        trackingCode: 'BN-TEST',
        fullName: 'تست سامانه اطلاع‌رسانی بینش',
        businessName: 'مدیریت بینش',
        phone: '09164006698',
        email: 'binesh.office@gmail.com',
        service: 'تست ارسال پیامک و ایمیل',
        notes: 'این یک پیام آزمایشی برای بررسی صحت تنظیمات پیامک و ایمیل است.',
        status: 'new' as const,
        adminNotes: '',
        isRead: true,
        notifiedSms: false,
        notifiedEmail: false,
        notificationLog: '',
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const result = await dispatchNewConsultationNotifications(dummyRecord);
      res.json({ ok: true, result });
    } catch (error) {
      res.status(500).json({ ok: false, error: (error as Error).message });
    }
  });

  // Organizations, Users & Portal Items Admin Management
  app.post('/api/admin/organizations', requireAdmin, async (req, res) => {
    try {
      const { id, name, contractModules, status } = req.body || {};
      const orgId = String(id || `org-${Date.now()}`).trim();
      await upsertOrganization({
        id: orgId,
        name: String(name || '').trim(),
        contractModules: Array.isArray(contractModules)
          ? contractModules
          : ['داشبوردهای مدیریتی'],
        status: String(status || 'فعال'),
        createdAt: new Date().toISOString()
      });
      res.json({ ok: true, organizations: await getOrganizations() });
    } catch (error) {
      console.error('Upsert org error:', error);
      res.status(500).json({ ok: false, error: 'خطا در ذخیره سازمان' });
    }
  });

  app.post('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const { fullName, phone, email, password, role, organizationId } = req.body || {};
      if (!fullName || !phone || !email || !password) {
        res.status(400).json({ ok: false, error: 'نام، تلفن، ایمیل و رمز عبور الزامی است.' });
        return;
      }
      await createUser({
        fullName: String(fullName).trim(),
        phone: String(phone).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash: hashPassword(String(password)),
        role: role || 'manager',
        organizationId: organizationId || null,
        isActive: true
      });
      res.json({ ok: true, users: await getUsers() });
    } catch (error) {
      console.error('Admin create user error:', error);
      res.status(500).json({ ok: false, error: 'خطا در ایجاد کاربر جدید (شماره یا ایمیل تکراری)' });
    }
  });

  app.patch('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { fullName, role, organizationId, password, isActive } = req.body || {};
      await updateUser(id, {
        fullName,
        role,
        organizationId,
        passwordHash: password ? hashPassword(String(password)) : undefined,
        isActive
      });
      res.json({ ok: true, users: await getUsers() });
    } catch (error) {
      console.error('Admin update user error:', error);
      res.status(500).json({ ok: false, error: 'خطا در ویرایش کاربر' });
    }
  });

  app.post('/api/admin/portal-items', requireAdmin, async (req, res) => {
    try {
      const { organizationId, type, title, description, urlOrMeta, status, dateLabel } =
        req.body || {};
      await createPortalItem({
        organizationId: String(organizationId || 'org-kabinowood'),
        type: type || 'dashboard',
        title: String(title || '').trim(),
        description: String(description || '').trim(),
        urlOrMeta: String(urlOrMeta || '').trim(),
        status: String(status || 'منتشر شده').trim(),
        dateLabel: String(dateLabel || '').trim()
      });
      res.json({ ok: true, portalItems: await getPortalItems() });
    } catch (error) {
      console.error('Create portal item error:', error);
      res.status(500).json({ ok: false, error: 'خطا در افزودن آیتم پورتال مشتریان' });
    }
  });

  app.delete('/api/admin/portal-items/:id', requireAdmin, async (req, res) => {
    try {
      await deletePortalItem(Number(req.params.id));
      res.json({ ok: true, portalItems: await getPortalItems() });
    } catch (error) {
      console.error('Delete portal item error:', error);
      res.status(500).json({ ok: false, error: 'خطا در حذف آیتم پورتال' });
    }
  });

  app.patch('/api/admin/analysis-requests/:id', requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status, adminResponse } = req.body || {};
      await updateAnalysisRequest(id, {
        status: String(status || 'در حال بررسی'),
        adminResponse: String(adminResponse || '')
      });
      res.json({ ok: true, analysisRequests: await getAnalysisRequests() });
    } catch (error) {
      console.error('Update analysis request error:', error);
      res.status(500).json({ ok: false, error: 'خطا در ثبت پاسخ درخواست تحلیل' });
    }
  });

  // ==========================================================================
  // VITE MIDDLEWARE (DEVELOPMENT) OR STATIC FILES (PRODUCTION)
  // ==========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Binesh Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
