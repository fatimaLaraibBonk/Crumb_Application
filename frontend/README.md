# Crumb — Frontend

React + Vite + Tailwind v4, wired to the FastAPI auth routes.

## Setup

```bash
npm install
cp .env.example .env   # already done for you, but if you clone fresh
npm run dev
```

Runs at http://localhost:5173 by default.

## Connecting to your backend

Set the backend URL in `.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

Change it to wherever `uvicorn` is actually serving your FastAPI app.
Anything not prefixed with `VITE_` is invisible to the frontend — that's
a Vite security thing, not a bug, so don't rename this var.

**You'll also need CORS enabled on the FastAPI side**, or the browser
will block every request from localhost:5173 even if the backend is
running fine. In your FastAPI app entrypoint:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Adding the "Matcha Mint" font

Drop your font file(s) in `public/fonts/`:

```
public/fonts/MatchaMint.woff2
public/fonts/MatchaMint.otf
```

The `@font-face` rule in `src/index.css` already points at those paths —
nothing else to wire up. If you don't have the file yet, leave the
folder empty; the app falls back to a generic cursive font until you add it.

Comfortaa (body font) is pulled live from Google Fonts, no local file needed.

## Project structure

```
src/
  api/
    client.js     axios instance, reads VITE_API_BASE_URL
    auth.js       one function per auth endpoint, matches auth_router.py
  CrumbAuth.jsx    the login/signup screen
  App.jsx
  index.css        Tailwind + font imports
public/
  fonts/           put Matcha Mint files here
```

## Known backend quirks this frontend currently matches

These live in your `auth_validator.py` — flagging here so the mismatch
doesn't confuse future-you. Fix them backend-side whenever you get to it,
then update `src/api/auth.js` to match:

- `VerifyEmailSchema` field is spelled `verifcation_code` (typo), and its
  validator decorator targets a differently-spelled field, so validation
  on that field silently never runs.
- `check_verification_code` (used in both `VerifyResetCodeSchema` and
  `VerifyEmailSchema`) doesn't `return v` — Pydantic will coerce a valid
  code down to `None`.
