/**
 * api.ts — Centralised HTTP client for the FastAPI backend.
 *
 * Every backend call in the app goes through this module.
 * Auth token (JWT) is injected automatically from localStorage.
 */

const BASE = '/api';

// ── Token helpers ─────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('auth_token');
}

// ── Backend health check ──────────────────────────────────────────────────
// Used by ChatTab to decide whether to use real API or demo fallback

export async function isBackendAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/docs`, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Generic fetch wrapper ─────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    // Try to extract a detail message from FastAPI error responses
    let detail = `Server error ${res.status}`;
    try {
      const body = await res.json();
      if (body.detail) {
        detail = typeof body.detail === 'string'
          ? body.detail
          : JSON.stringify(body.detail);
      }
    } catch { /* ignore parse failure */ }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────

export interface UserOut {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<UserOut> {
  return request<UserOut>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login(
  usernameOrEmail: string,
  password: string,
): Promise<TokenResponse> {
  const data = await request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username_or_email: usernameOrEmail,
      password,
    }),
  });
  setToken(data.access_token);
  return data;
}

export function logout(): void {
  clearToken();
}

export async function fetchMe(): Promise<UserOut> {
  return request<UserOut>('/auth/me');
}

// ── File upload ───────────────────────────────────────────────────────────

export interface UploadedFile {
  original_name: string;
  saved_as: string;
  size_bytes: number;
}

export interface UploadResponse {
  message: string;
  uploaded: UploadedFile[];
}

export async function uploadFiles(files: File[]): Promise<UploadResponse> {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  return request<UploadResponse>('/upload/files', {
    method: 'POST',
    body: form,
  });
}

// ── AI Chat ───────────────────────────────────────────────────────────────

export interface MessageResponse {
  ok: boolean;
  result: {
    'input message': string;
    response: { output_text: string } | null;
  };
}

export async function sendMessage(
  userPrompt: string,
  systemPrompt?: string,
  model?: string,
  signal?: AbortSignal,
): Promise<string> {
  const body: Record<string, string> = { user_prompt: userPrompt };
  if (systemPrompt) body.system_prompt = systemPrompt;
  if (model) body.model = model;

  const data = await request<MessageResponse>('/apicall/message', {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  });

  // Extract the text from the structured response
  return data.result?.response?.output_text
    ?? JSON.stringify(data.result?.response)
    ?? 'No response received.';
}
