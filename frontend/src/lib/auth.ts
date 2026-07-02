const TOKEN_KEY = "prepcrack_auth_token";

// Helper to base64 decode strings in browser
const base64Decode = (str: string): string => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    return "";
  }
};

export interface UserSession {
  username: string;
  role: string;
  exp: number;
}

// Decode and verify token
export function getSession(): UserSession | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }

  try {
    // parts[1] is the base64-encoded JWT payload
    const payloadStr = base64Decode(parts[1]);
    const payload = JSON.parse(payloadStr);
    
    // Check expiration (JWT exp is in seconds, javascript Date.now() in milliseconds)
    const expMs = payload.exp * 1000;
    if (expMs < Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return {
      username: payload.sub,
      role: payload.role,
      exp: expMs,
    };
  } catch (e) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

// Check if user has active valid session
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

// Retrieve active raw token
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Login verification calling DB backend API
export async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Authentication failed." };
    }

    // Store JWT token
    localStorage.setItem(TOKEN_KEY, data.token);
    return { success: true };
  } catch (err) {
    console.error("Login request error:", err);
    return { success: false, error: "Network error. Failed to connect to server." };
  }
}

// Logout session
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}
