import { apiFetch } from "./api";

const sessionKey = "session.data";

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  const t = Date.parse(expiresAt);
  if (Number.isNaN(t)) return true;
  return t <= Date.now();
}

type LoginPayload = {
  email: string;
  password: string;
};

export type LoginData = {
  token: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: string;
  name: string;
  role: string;
};

export type Session = {
  token: string | null;
  refreshToken: string | null;
  name: string | null;
  role: string | null;
  expiresAt: string | null;
};

type StoredSession = {
  token: string;
  refreshToken: string;
  name: string;
  role: string;
  expiresAt: string;
};

function emptySession(): Session {
  return {
    token: null,
    refreshToken: null,
    name: null,
    role: null,
    expiresAt: null,
  };
}

function readSessionFromStorage(): Session {
  if (typeof window === "undefined") {
    return emptySession();
  }
  const raw = window.localStorage.getItem(sessionKey);
  if (!raw) {
    return emptySession();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    const session: Session = {
      token: parsed.token ?? null,
      refreshToken: parsed.refreshToken ?? null,
      name: parsed.name ?? null,
      role: parsed.role ?? null,
      expiresAt: parsed.expiresAt ?? null,
    };
    if (isExpired(session.expiresAt)) {
      window.localStorage.removeItem(sessionKey);
      return emptySession();
    }
    return session;
  } catch {
    return emptySession();
  }
}

export async function login(payload: LoginPayload): Promise<LoginData> {
  const data = await apiFetch<LoginData>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (typeof window !== "undefined") {
    const session: StoredSession = {
      token: data.token,
      refreshToken: data.refreshToken,
      name: data.name,
      role: data.role,
      expiresAt: data.expiresAt,
    };
    window.localStorage.setItem(sessionKey, JSON.stringify(session));
  }
  return data;
}

export function getSession(): Session {
  return readSessionFromStorage();
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(sessionKey);
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("user_name");
  window.localStorage.removeItem("user_role");
  window.localStorage.removeItem("token_expires_at");
}

type ApiEnvelope<T> = {
  status: "success" | "error";
  message: string;
  data: T;
  errors?: unknown;
};

export async function logout(): Promise<string | null> {
  let message: string | null = null;
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const url = `${apiBaseUrl}/api/auth/logout`;
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    const current = readSessionFromStorage();
    if (current.token) {
      headers.set("Authorization", `Bearer ${current.token}`);
    }
    const response = await fetch(url, { method: "POST", headers });
    let json: ApiEnvelope<null> | undefined;
    try {
      json = (await response.json()) as ApiEnvelope<null>;
    } catch {
      json = undefined;
    }
    if (json && typeof json.message === "string") {
      message = json.message;
    }
  } catch {}
  clearSession();
  return message;
}
