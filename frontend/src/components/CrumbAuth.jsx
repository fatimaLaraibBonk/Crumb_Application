import { useState } from "react";
import { login, signup, verifyEmail } from "../api/auth";
import { extractErrorMessage } from "../api/client";

/*
  Crumb — Login / Sign up
  ------------------------
  Fonts required (not bundled here — add to your project):
    - "Matcha Mint"  → used for the "Crumb" wordmark only
    - "Comfortaa"    → used for everything else (Google Font, easy to pull in)

  If you're using this outside a build step that already loads fonts,
  drop this in your index.html <head>:

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;700&display=swap" rel="stylesheet">

  "Matcha Mint" isn't a Google Font — if it's a font file you own, @font-face
  it in your global CSS:

    @font-face {
      font-family: "Matcha Mint";
      src: url("/fonts/MatchaMint.woff2") format("woff2");
    }

  Field names below match your pydantic schemas exactly:
    LoginSchema      -> email, password
    UserSignUp       -> email, password, username, dob
*/

const COLORS = {
  bg: "#e8e5dd",
  nav: "#2a3723",
  navText: "#b9bba8",
  heading: "#0c0a08",
  button: "#dcbc98",
  buttonText: "#2a3723",
};

function validateSignup({ username, email, password, dob }) {
  const errors = {};
  if (!username || username.trim().length === 0) {
    errors.username = "username must be atleast a character long";
  }
  if (!email || email.trim().length === 0) {
    errors.email = "email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "enter a valid email";
  }
  if (!password || password.trim().length < 8) {
    errors.password = "password must be atleast 8 characters long";
  } else if (password.trim().length > 20) {
    errors.password = "password can not be greater than 20 characters";
  }
  if (!dob) {
    errors.dob = "date of birth is required";
  }
  return errors;
}

function validateLogin({ email, password }) {
  const errors = {};
  if (!email || email.trim().length === 0) {
    errors.email = "email is required";
  }
  if (!password || password.length < 1) {
    errors.password = "password is required";
  }
  return errors;
}

function validateCode(code) {
  const errors = {};
  if (!code || code.trim().length !== 6 || !/^\d{6}$/.test(code.trim())) {
    errors.code = "enter the 6-digit code from your email";
  }
  return errors;
}

function Field({ label, error, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-bold mb-1.5" style={{ color: COLORS.heading }}>
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs font-bold" style={{ color: "#7a2b1f" }}>
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  "w-full px-3 py-2.5 bg-white border-2 outline-none rounded-none shadow-none " +
  "transition-all duration-100 " +
  "hover:translate-x-[-2px] hover:translate-y-[-2px] " +
  "focus:translate-x-[-2px] focus:translate-y-[-2px]";

function inputStyle(hasError) {
  const shadowColor = hasError ? "#7a2b1f" : COLORS.heading;
  return {
    borderColor: hasError ? "#7a2b1f" : COLORS.heading,
    color: COLORS.heading,
    boxShadow: "none",
  };
}

function inputClass(hasError) {
  const shadow = hasError
    ? "hover:shadow-[3px_3px_0_#7a2b1f] focus:shadow-[3px_3px_0_#7a2b1f]"
    : "hover:shadow-[3px_3px_0_#0c0a08] focus:shadow-[3px_3px_0_#0c0a08]";
  return `${inputBase} ${shadow}`;
}

export default function CrumbAuth() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "verify"
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    dob: "",
  });
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setSubmitted(false);
    setApiError("");
    setResendMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setResendMessage("");

    if (mode === "verify") {
      const validationErrors = validateCode(code);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;

      setLoading(true);
      try {
        await verifyEmail({
          verification_code: code.trim(),
          email: form.email,
          password: form.password,
          username: form.username,
          dob: form.dob,
        });
        setSubmitted(true);
      } catch (err) {
        setApiError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    const validationErrors =
      mode === "signup" ? validateSignup(form) : validateLogin(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
        setSubmitted(true);
      } else {
        await signup({
          email: form.email,
          password: form.password,
          username: form.username,
          dob: form.dob,
        });
        // Account isn't created yet — backend only sent a code.
        // Move to the verify screen, keep the form data for later.
        setErrors({});
        setCode("");
        setMode("verify");
      }
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setApiError("");
    setResendMessage("");
    setResending(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        username: form.username,
        dob: form.dob,
      });
      setResendMessage("A new code was sent to your email.");
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{ backgroundColor: COLORS.bg, fontFamily: "Comfortaa, sans-serif" }}
    >
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <h1
            className="text-5xl mb-2"
            style={{
              color: COLORS.heading,
              fontFamily: "'Matcha Mint', cursive",
              letterSpacing: "0.02em",
            }}
          >
            Crumb
          </h1>
          <p
            className="text-sm font-medium"
            style={{ color: COLORS.heading, opacity: 0.75 }}
          >
            your gluten-free buddy app
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-white border-2 p-8 shadow-none hover:shadow-[8px_8px_0_#0c0a08] transition-shadow duration-150"
          style={{ borderColor: COLORS.heading }}
        >
          {submitted ? (
            <div className="text-center py-6">
              <p className="font-bold text-lg" style={{ color: COLORS.heading }}>
                {mode === "login"
                  ? "Logged in."
                  : mode === "verify"
                  ? "Account created."
                  : "Account created."}
              </p>
              <p className="text-sm mt-2" style={{ color: COLORS.heading, opacity: 0.7 }}>
                (Wire this up to whatever comes next — dashboard redirect, etc.)
              </p>
            </div>
          ) : mode === "verify" ? (
            <form onSubmit={handleSubmit} noValidate>
              <p className="text-sm mb-5" style={{ color: COLORS.heading, opacity: 0.8 }}>
                We sent a 6-digit code to <strong>{form.email}</strong>. Enter it
                below to finish creating your account.
              </p>

              <Field label="Verification code" error={errors.code}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className={inputClass(errors.code)}
                  style={{ ...inputStyle(errors.code), letterSpacing: "0.3em" }}
                  autoComplete="one-time-code"
                  placeholder="000000"
                />
              </Field>

              {resendMessage && (
                <p className="text-xs font-bold mb-4" style={{ color: COLORS.heading }}>
                  {resendMessage}
                </p>
              )}

              {apiError && (
                <p
                  className="text-sm font-bold mb-4 border-2 px-3 py-2"
                  style={{ color: "#7a2b1f", borderColor: "#7a2b1f" }}
                >
                  {apiError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-bold border-2 rounded-none shadow-none transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#0c0a08] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                style={{
                  backgroundColor: COLORS.button,
                  color: COLORS.buttonText,
                  borderColor: COLORS.heading,
                }}
              >
                {loading ? "Verifying…" : "Verify email"}
              </button>

              <p className="text-center text-sm mt-6" style={{ color: COLORS.heading }}>
                Didn't get a code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-bold underline disabled:opacity-60"
                >
                  {resending ? "Sending…" : "Resend it"}
                </button>
              </p>
              <p className="text-center text-sm mt-3" style={{ color: COLORS.heading }}>
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-bold underline"
                >
                  Go back
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {mode === "signup" && (
                <Field label="Username" error={errors.username}>
                  <input
                    type="text"
                    value={form.username}
                    onChange={update("username")}
                    className={inputClass(errors.username)}
                    style={inputStyle(errors.username)}
                    autoComplete="username"
                  />
                </Field>
              )}

              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  className={inputClass(errors.email)}
                  style={inputStyle(errors.email)}
                  autoComplete="email"
                />
              </Field>

              {mode === "signup" && (
                <Field label="Date of birth" error={errors.dob}>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={update("dob")}
                    className={inputClass(errors.dob)}
                    style={inputStyle(errors.dob)}
                  />
                </Field>
              )}

              <Field label="Password" error={errors.password}>
                <input
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                  className={inputClass(errors.password)}
                  style={inputStyle(errors.password)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </Field>

              {mode === "login" && (
                <div className="text-right mb-6 -mt-2">
                  <button
                    type="button"
                    className="text-xs font-bold underline"
                    style={{ color: COLORS.heading }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {apiError && (
                <p
                  className="text-sm font-bold mb-4 border-2 px-3 py-2"
                  style={{ color: "#7a2b1f", borderColor: "#7a2b1f" }}
                >
                  {apiError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-bold border-2 rounded-none shadow-none transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#0c0a08] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                style={{
                  backgroundColor: COLORS.button,
                  color: COLORS.buttonText,
                  borderColor: COLORS.heading,
                }}
              >
                {loading
                  ? mode === "login"
                    ? "Logging in…"
                    : "Creating account…"
                  : mode === "login"
                  ? "Log in"
                  : "Create account"}
              </button>
            </form>
          )}

          {!submitted && mode !== "verify" && (
            <p className="text-center text-sm mt-6" style={{ color: COLORS.heading }}>
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-bold underline"
                  >
                    Create an account here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-bold underline"
                  >
                    Login here
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}