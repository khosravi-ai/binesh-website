export interface ConsultationRequestPayload {
  fullName: string;
  businessName?: string;
  phone: string;
  email?: string;
  service: string;
  notes?: string;
}

export interface ConsultationSubmitResponse {
  ok: boolean;
  trackingCode?: string;
  createdAt?: string;
  error?: string;
}

export interface TrackedConsultationInfo {
  trackingCode: string;
  fullName: string;
  businessName: string;
  service: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Submits a consultation request to the real backend database and triggers instant notifications.
 */
export async function submitConsultationRequest(
  payload: ConsultationRequestPayload
): Promise<ConsultationSubmitResponse> {
  try {
    const res = await fetch('/api/consultations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.error || 'ارسال درخواست انجام نشد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.'
      };
    }
    return {
      ok: true,
      trackingCode: data.trackingCode,
      createdAt: data.createdAt
    };
  } catch {
    return {
      ok: false,
      error: 'ارتباط با سرور برقرار نشد. لطفاً اتصال خود را بررسی کرده و دوباره تلاش کنید.'
    };
  }
}

/**
 * Looks up a submitted consultation request by its tracking code (e.g. BN-1042).
 */
export async function trackConsultationByCode(
  code: string
): Promise<{ ok: boolean; request?: TrackedConsultationInfo; error?: string }> {
  try {
    const res = await fetch(`/api/consultations/track/${encodeURIComponent(code.trim())}`);
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.error || 'درخواستی با این کد رهگیری یافت نشد.'
      };
    }
    return { ok: true, request: data.request };
  } catch {
    return {
      ok: false,
      error: 'خطا در استعلام وضعیت درخواست.'
    };
  }
}

// ============================================================================
// SESSION TOKEN STORAGE (IN-MEMORY + SESSION STORAGE FOR TAB PERSISTENCE)
// ============================================================================
let memoryAuthToken: string | null = null;

export function getAuthToken(): string | null {
  if (memoryAuthToken) return memoryAuthToken;
  try {
    return sessionStorage.getItem('binesh_auth_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  memoryAuthToken = token;
  try {
    if (token) {
      sessionStorage.setItem('binesh_auth_token', token);
    } else {
      sessionStorage.removeItem('binesh_auth_token');
    }
  } catch {
    // Ignore storage restrictions
  }
}

export type TrackedConsultation = TrackedConsultationInfo;

export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(url, {
    ...options,
    headers
  });
}
