const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

type ApiSuccess<T> = {
  status: "success";
  message: string;
  data: T;
};

type ApiErrorBody = {
  status: "error";
  message: string;
  errors?: unknown;
};

function extractErrorMessage(json: ApiErrorBody): string {
  const errors = json.errors as any;
  if (errors && typeof errors === "object") {
    if (typeof errors.message === "string") {
      return errors.message;
    }
    const values = Object.values(errors);
    for (const value of values) {
      if (typeof value === "string" && value.length > 0) {
        return value;
      }
      if (Array.isArray(value) && value.length > 0) {
        const first = value[0];
        if (typeof first === "string" && first.length > 0) {
          return first;
        }
      }
    }
  }
  if (json.message && json.message.length > 0) {
    return json.message;
  }
  return "Permintaan gagal";
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${apiBaseUrl}${path}`;
  const headers = new Headers(init?.headers || {});
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (typeof window !== "undefined" && !headers.has("Authorization")) {
    const raw = window.localStorage.getItem("session.data");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { token?: string | null };
        if (parsed.token) {
          headers.set("Authorization", `Bearer ${parsed.token}`);
        }
      } catch {}
    }
  }
  const response = await fetch(url, { ...init, headers });
  let json: ApiSuccess<T> | ApiErrorBody;
  try {
    json = await response.json();
  } catch {
    throw new Error("Gagal membaca respons dari server");
  }
  if (!response.ok || json.status !== "success") {
    const message = extractErrorMessage(json as ApiErrorBody);
    throw new Error(message);
  }
  if (typeof window !== "undefined") {
    const newToken = response.headers.get("x-access-token");
    if (newToken) {
      const expiresAtHeader = response.headers.get("x-access-expires-at");
      const rawSession = window.localStorage.getItem("session.data");
      let stored: any = {};
      if (rawSession) {
        try {
          stored = JSON.parse(rawSession);
        } catch {
          stored = {};
        }
      }
      stored.token = newToken;
      if (expiresAtHeader) {
        stored.expiresAt = expiresAtHeader;
      }
      window.localStorage.setItem("session.data", JSON.stringify(stored));
    }
  }
  return (json as ApiSuccess<T>).data;
}
