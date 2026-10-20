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
