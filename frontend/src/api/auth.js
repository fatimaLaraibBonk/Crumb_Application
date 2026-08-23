import client from "./client";

// Matches app/routers/auth_router.py exactly.
// Route paths and payload shapes are 1:1 with your pydantic schemas.

export function signup({ email, password, username, dob }) {
  return client.post("/auth/signup", { email, password, username, dob });
}

export function verifyEmail({ verification_code, email, password, username, dob }) {
  return client.post("/auth/verify-email", {
    verification_code,
    email,
    password,
    username,
    dob,
  });
}

export function login({ email, password }) {
  return client.post("/auth/login", { email, password });
}

export function forgotPassword({ email }) {
  return client.post("/auth/forgot_password", { email });
}

export function verifyResetCode({ email, reset_code }) {
  return client.post("/auth/verify-reset-code", { email, reset_code });
}

export function resetPassword({ new_password }) {
  return client.post("/auth/reset_password", { new_password });
}