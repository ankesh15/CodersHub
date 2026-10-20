# Hosting configuration

No deployment is performed by this change. Review and merge the branch before an
operator chooses to update production. The GitHub workflow only runs checks.

## Frontend: Vercel

Configure the intended CodersHub project with:

| Setting | Value |
| --- | --- |
| Repository | `ankesh15/CodersHub` |
| Production branch | `main` |
| Root Directory | `frontend` |
| Framework | Vite |
| Node | 22.x, at least 22.12.0 |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist` |
| `VITE_API_BASE_URL` | Public HTTPS API URL including `/api` |

The existing compiled frontend points to
`https://codershub-jxst.onrender.com/api`. Confirm this remains the intended API
before reusing it. Vite embeds this value at build time. Never put database
credentials, OAuth client secrets, session secrets, or private tokens in `VITE_*`.

`VITE_API_URL` remains supported as a legacy alias; the configuration appends
`/api` once. Prefer `VITE_API_BASE_URL`.

A build now requires an explicit API destination. `/api` is accepted only as an
explicit choice for an operator-configured same-origin reverse proxy. The
repository's Vercel configuration is a static frontend configuration and does
**not** provide that API proxy. Set the absolute backend URL for the current
split-hosting arrangement. The local Vite development/preview proxy is not a
production hosting proxy.

`frontend/vercel.json` serves existing assets before the SPA fallback. It also
supports direct navigation to handles containing dots. A project using the
repository root must have its root corrected; there is deliberately no root
`package.json`. Do not infer that this caused a historical build failure without
reading that deployment's logs.

## Backend: Render or another long-running Node host

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Node | 22.x, at least 22.12.0 |
| Install/build | `npm ci --omit=dev` |
| Start | `npm start` |
| Health check | `/api/health` |
| `NODE_ENV` | `production` |
| `MONGO_URI` (or `MONGODB_URI`) | Private MongoDB connection string |
| `SESSION_SECRET` | Newly generated random secret, at least 32 characters |
| `FRONTEND_URL` | Exact public HTTPS frontend origin, no path |

Allow the host to supply `PORT`. Production requires reachable MongoDB and uses
it for persistent sessions. Verify Atlas network access, database credentials,
DNS, and permissions for both users and the `sessions` collection. This change
does not alter hosted databases or their contents.

`FRONTEND_URL` must match the browser's origin; arbitrary Vercel preview URLs are
not automatically trusted. Use a dedicated test backend for previews if needed.
The application trusts one reverse-proxy hop in production. Ensure your host
provides HTTPS and the expected forwarded-protocol header. Secure, HttpOnly,
SameSite=None cookies are tested. Browsers may block cross-site cookies; custom
same-site domains or a properly configured reverse proxy may be needed.

Optional GitHub OAuth requires both `GITHUB_CLIENT_ID` and
`GITHUB_CLIENT_SECRET`, plus an explicit HTTPS `BACKEND_URL` origin. Register
`<BACKEND_URL>/api/auth/github/callback` in the GitHub OAuth application. Real
provider sign-in requires those credentials and was not performed here.
`GITHUB_TOKEN` is optional and belongs only on the backend.

Configuration is checked before database connections open. Missing origins,
incomplete OAuth configuration, weak session secrets, and unavailable MongoDB
produce startup errors. A startup/listen failure closes database connections
instead of leaving the process hanging.

## Operator follow-up and unavailable evidence

GitHub records multiple Vercel failures, but the connected Vercel team currently
returns no projects and returns 404 for the failed deployment IDs. Recover the
original project/deployment records or provide exported build logs and project
settings. The precise failed-build causes remain unverified.

The current Render URL returns 401 JSON for `/api/auth/me` but 404 HTML for
`/api/health`, whereas this source defines `/api/health`. Check the Render
service's repository, branch, root, start command, deployed commit, and runtime
logs. The available evidence indicates a different/older backend is running;
it does not establish which hosting setting caused the mismatch. Render logs
were not accessible through a connected account in this session.

Old Git history contains a hardcoded placeholder session signing value. If any
deployment used it, replace its session secret with a new random value and
invalidate existing sessions. No real credential value was found by the scoped
source/history scan, and none is included in this change.

The legacy CodeChef upstream (`codechef-api.vercel.app`) returns HTTP 402
`Payment required`. The API reports its failure explicitly. Restoring CodeChef
requires an available, supported provider; do not add paid credentials or
substitute fabricated statistics. GitHub, LeetCode, and Codeforces are the active
frontend integrations.

Tailwind was migrated with the official v4.3.3 upgrader to remove vulnerable v3
build dependencies. Its browser targets are Safari 16.4+, Chrome 111+, and Firefox
128+. The migrated dark-mode, borders, shadows, gradients, and focus utilities
are included in the source. See the [official upgrade guide](https://tailwindcss.com/docs/upgrade-guide).

## Read-only deployed verification

Use the hosted verifier after a deployment has been authorized and completed, or
against an existing deployment during investigation:

```bash
VERIFY_FRONTEND_URL=https://your-frontend.example \
VERIFY_BACKEND_URL=https://your-backend.example \
npm --prefix backend run test:deployment
```

It sends only GET and OPTIONS requests. It checks SPA routes (including dots),
JavaScript assets, the compiled API reference, database-readiness JSON,
anonymous-session behavior, credentialed CORS/preflight, and exclusion of private
fields from the public directory. It never signs in or changes user data. Output
contains status codes, field names and counts, never profile values. A failing
contract exits 1; a successful frontend build alone is not a passing deployment.

### Confirmed Render state from authenticated inspection

The intended service is `CodersHub`, `srv-d8ldqtpkh4rs73ee56eg`, in the confirmed
workspace `tea-d8l4becvikkc73ccosrg`. Its URL is
`https://codershub-jxst.onrender.com`. Its configured repository, `main` branch,
`backend` root and `npm start` command match the intended service. The configured
build command is `npm install`, and the HTTP health-check path is empty.

The only deploy returned by the paginated history is
`dep-d8ldqu1kh4rs73ee56o0`, status `live`, commit
`eb21bccfb54df99b4ebd960fc97a184324239db0` (June 11, 2026). This is older than
current main and PR #1. Runtime logs show successful MongoDB connections and
port 10000, so the missing `/api/health` endpoint is explained by the deployed
old source, which only defines `/` as health. The reason later commits did not
produce deploy records is not established by the available history; check the
Git provider connection and auto-deploy integration in the Dashboard.

Current live CORS responses allow `http://localhost:5173`, which does not match
the Vercel frontend. Public profile responses also fail the private-field
contract already fixed in current source. These remain production failures;
local code fixes and successful GitHub Actions have not repaired the running
backend. No production configuration or deploy was changed during inspection.

Environment values were not retrieved: the connected MCP exposes no read-only
environment-variable getter, the CLI has no configured authentication, and the
Dashboard requires sign-in. Privately inspect required keys in the service's
Environment tab; do not paste or log them. Confirm `FRONTEND_URL` is the intended
canonical HTTPS frontend origin, a private MongoDB URI is configured, the
session secret is strong, and optional OAuth is fully configured.

After explicitly authorizing a release of reviewed code, verify the new deployed
commit and `/api/health` response before changing the Render HTTP health-check
path to `/api/health`. Changing the path while the old code is running would
make health checks fail. Preview frontends need their own compatible backend
origin/environment; do not use wildcard credentialed CORS to accommodate them.
