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
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    // pydantic validation errors: [{ loc, msg, type }, ...]
    return detail.map((d) => d.msg).join(" ");
  }
  return "Something went wrong. Please try again.";
}

export default client;
