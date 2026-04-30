# Security Patches & Upgrades Implementation Log

This document covers the comprehensive security changes applied to the core platform encompassing the Django Rest Framework (_DRF_) backend and the React API integrations.

## 1. Secrets & Credentials Management 
**Status:** ✅ Solved
**Component Affected:** `settings.py`, `views.py`, `.env`

**Details:**
Prior configuration exposed critical application identifiers such as database passwords and active AI API keys natively in the code. A system-wide `.env` variable ingestion pipeline was erected using `os.getenv` allowing keys to run securely. 

* **Extracted MySQL Root Passwords** from standard code paths and stored them securely.
* **Extracted Django Secret Key** and loaded securely.
* **Extracted PowerBI API Export Key**, resolving hardcoded verification in the dashboard view endpoints.

## 2. Advanced JWT Security & HttpOnly Protocol
**Status:** ✅ Solved
**Component Affected:** `settings.py`, `core.authentication`, `views.py`, `api.js`

**Details:**
Authentication tokens were previously assigned directly to HTML5 `localStorage`, causing vulnerabilities related to Cross-Site Scripting (XSS) payload attacks (in which a malicious browser extension might access and steal user tokens). 

* **Backend Custom JWT Middleware:** Created custom `CookieJWTAuthentication` that actively pulls JWT tokens securely from HTTP traffic rather than requiring headers.
* **Frontend Refactor (`withCredentials`):** Altered Axios (`api.js`) to automatically carry restricted cookie credentials directly over network.
* **Overridden Standard SimpleJWT Controllers:** Redesigned token creation at `CustomTokenObtainPairView` to dispatch JSON Web Tokens inside strictly governed `Set-Cookie` Headers constrained by `HttpOnly` and `SameSite='Lax'`.

## 3. Server-side Rate Limiting Strategy (DDoS Prevention)
**Status:** ✅ Solved
**Component Affected:** `settings.py`

**Details:**
The server historically allowed unbounded hits, establishing heavy risks to ML endpoints and API availability (Denial of Service + Brute Force Passwords).

* Configured native DRF `AnonRateThrottle` limiting unidentified machines to `10 requests/minute`.
* Configured native DRF `UserRateThrottle` governing identified accounts safely to `1000 requests/day`.

## 4. Cross-Origin Resource Locking (CORS)
**Status:** ✅ Solved
**Component Affected:** `settings.py`

**Details:** 
The platform previously permitted widespread Internet invocation using the wildcard CORS format `CORS_ALLOW_ALL_ORIGINS = True`. 

* Stripped wildcard permissive origins.
* Safely established direct point-to-point CORS communication over targeted React local domains (`localhost:3000, 5173`).
* Activated `CORS_ALLOW_CREDENTIALS` logic guaranteeing the previous HttpOnly secure headers wouldn't be rejected during transit.

## 5. Logout Security & Session Forgetting Endpoint
**Status:** ✅ Solved
**Component Affected:** `urls.py`, `views.py`, `api.js`

**Details:**
* Rebuilt the underlying logout functionality across both architectures to not only purge React configurations but actively invoke a backend ping to a new `LogoutView` endpoint structured strictly to forcefully rewrite and command browser endpoints to permanently destruct `access` and `refresh` secure cookies.
