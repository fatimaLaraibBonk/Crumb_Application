// Tiny wrapper around localStorage so the rest of the app never touches it directly.
// NOTE: this only remembers who is logged in for display purposes (e.g. "Hello, name").
// It is NOT real authentication — once your backend issues a token (JWT/session),
// store/send that here instead.

const KEY = "crumb_user";

export function getUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function clearUser() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
