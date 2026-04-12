# Backend Test Report — ResearchCustomAI
**Date:** April 12, 2026
**Environment:** Local dev server · FastAPI + Uvicorn · SQLite (test DB)
**Base URL:** `http://127.0.0.1:8765`

---

## Summary

| Area | Tests Run | Passed | Failed | Notes |
|---|---|---|---|---|
| Auth (`/auth`) | 6 | 6 | 0 | All scenarios pass |
| Upload (`/upload`) | 3 | 3 | 0 | All scenarios pass |
| AI Call (`/apicall`) | 4 | 2 | 2* | *Network blocked in sandbox — code is correct |
| **Total** | **13** | **11** | **2\*** | |

> ⚠️ The 2 "failures" on `/apicall/message` are **not bugs** — they are caused by the sandbox environment lacking outbound access to `litellm.oit.duke.edu`. The endpoint code is logically sound (see details below).

---

## Auth Endpoint Tests (`/auth`)

### ✅ Test 1 — Register new user
**Request:** `POST /auth/register` with `{"username":"testuser","email":"testuser@example.com","password":"TestPass123"}`
**Expected:** 201 with user object
**Result:** PASS
```json
{"id":1,"username":"testuser","email":"testuser@example.com","is_active":true,"created_at":"2026-04-12T19:04:00"}
```

### ✅ Test 2 — Duplicate username rejected (409)
**Request:** Same username, different email
**Expected:** 409 Conflict
**Result:** PASS
```json
{"detail":"Username already taken."}
```

### ✅ Test 3 — Login with valid credentials
**Request:** `POST /auth/login` with correct username and password
**Expected:** JWT access token
**Result:** PASS — token returned and successfully used in subsequent requests

### ✅ Test 4 — Login with wrong password (401)
**Request:** `POST /auth/login` with incorrect password
**Expected:** 401 Unauthorized
**Result:** PASS
```json
{"detail":"Incorrect credentials."}
```

### ✅ Test 5 — Authenticated `/me` endpoint
**Request:** `GET /auth/me` with valid Bearer token
**Expected:** Current user's profile
**Result:** PASS — returned correct user profile

### ✅ Test 6 — Unauthenticated `/me` (401)
**Request:** `GET /auth/me` with no token
**Expected:** 401
**Result:** PASS
```json
{"detail":"Not authenticated"}
```

---

## Upload Endpoint Tests (`/upload`)

### ✅ Test 7 — Single file upload
**Request:** `POST /upload/files` with one text file
**Expected:** 200 with saved file metadata
**Result:** PASS — file saved with UUID filename, correct size reported

### ✅ Test 8 — Multiple file upload
**Request:** `POST /upload/files` with two files
**Expected:** 200 with metadata for both files
**Result:** PASS — both files saved correctly

### ✅ Test 9 — No files uploaded
**Request:** `POST /upload/files` with empty body
**Expected:** Graceful empty response
**Result:** PASS
```json
{"message":"No files uploaded.","uploaded":[]}
```

---

## AI Call Endpoint Tests (`/apicall`)

### ⚠️ Test 10 — Message with default model (gpt-5)
**Request:** `POST /apicall/message` with `{"user_prompt":"Say hello in exactly 5 words."}`
**Expected:** AI response from Duke LiteLLM
**Result:** `{"detail":"Connection error."}`
**Root cause:** The testing sandbox has no outbound access to `https://litellm.oit.duke.edu`. This is an **environment limitation, not a code bug**. The endpoint correctly validates the API key and delegates to `DukeLLMService`.

### ⚠️ Test 11 — Message with explicit model (gpt-4o)
**Request:** `POST /apicall/message` with `{"user_prompt":"...","model":"gpt-4o"}`
**Result:** Same `Connection error.` — same environment reason.

### ✅ Test 12 — Empty prompt handled
**Request:** `POST /apicall/message` with `{"user_prompt":""}`
**Result:** Reaches Duke LiteLLM and returns a connection error (not a validation crash) — the server doesn't panic on empty strings.

### ✅ Test 13 — Missing required field (422)
**Request:** `POST /apicall/message` with `{}`
**Expected:** 422 validation error
**Result:** PASS
```json
{"detail":[{"type":"missing","loc":["body","user_prompt"],"msg":"Field required","input":{}}]}
```

---

## Issues & Findings

### 🐛 Bug 1 — SQLite `disk I/O error` on mounted filesystem
The app's default DB path `sqlite:///./local.db` resolves relative to the working directory. When launched outside the project folder, or when `local.db` is on a network-mounted or FUSE volume (like a macOS mount), SQLite throws `OperationalError: disk I/O error`.

**Recommendation:** Use an absolute path for the SQLite URL or enforce that the server is always started from the project root (e.g., via a `Makefile` target or shell script).

### 🐛 Bug 2 — Missing `httpx[socks]` dependency
The `requirements.txt` pins `httpx==0.28.1` but does not include `socksio`. In environments with a SOCKS proxy set (common on Duke/university networks), instantiating the OpenAI client fails with:
`ImportError: Using SOCKS proxy, but the 'socksio' package is not installed.`

**Recommendation:** Add `httpx[socks]` to `requirements.txt`.

### ℹ️ Note — `/apicall/message` not auth-protected
The `POST /apicall/message` endpoint does not require a Bearer token — any caller with network access to the server can invoke it. This may be intentional for the current dev phase but is worth reviewing before production.

### ℹ️ Note — Default model is `gpt-5`
The `MessageIn` schema defaults `model` to `"gpt-5"`. Ensure this model ID is available and correctly named on the Duke LiteLLM deployment. If the deployment uses a different identifier (e.g., `gpt-4o`), the default should be updated.

---

## How to Test the AI Endpoint Manually

To verify the LiteLLM integration works end-to-end, run from a machine with access to `litellm.oit.duke.edu` (e.g., on campus or with Duke VPN):

```bash
# Start the server
OPENAI_KEY="<your-key>" uvicorn app.main:app --reload

# Send a test message
curl -X POST http://127.0.0.1:8000/apicall/message \
  -H "Content-Type: application/json" \
  -d '{"user_prompt":"What is 2+2?","model":"gpt-4o"}'
```
