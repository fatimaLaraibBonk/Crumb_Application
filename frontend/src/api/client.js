import axios from "axios";

// Set VITE_API_BASE_URL in your .env file (see .env.example).
// Vite only exposes env vars prefixed with VITE_ to the browser.
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Normalizes FastAPI/pydantic error responses into a plain string
// so components don't need to know the shape of the error payload.
export function extractErrorMessage(error) {
  // Always log the raw error — check the browser console for this.
  console.error("API error:", error);

  if (!error?.response) {
    // Request never got a response at all: backend down, wrong port/URL,
    // or CORS blocked it before the browser could read the response.
    return "Can't reach the server. Is the backend running, and does VITE_API_BASE_URL match its port?";
  }

  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    // pydantic validation errors: [{ loc, msg, type }, ...]
    return detail.map((d) => d.msg).join(" ");
  }
  return `Server responded with ${error.response.status}. Check the console for details.`;
}

export default client;
