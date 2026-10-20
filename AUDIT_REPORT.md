# CodersHub investigation and verification

Date: 20 October 2026 (India time). Base: `main` at
`5651a432f99c437871bba291dc5f10d15651f828`.
Working branch: `fix/deployment-and-application-audit`.

## Scope and evidence

Inspected every tracked source, configuration, test and documentation file before
editing application code, including both manifests/lockfiles, Express startup,
MongoDB/session storage, Passport OAuth, user/platform routes, all React screens,
hooks, metrics, styles, Vite/Vercel configuration and existing browser tests.
There were no unrelated working changes in this fresh clone and no applicable
AGENTS.md files. A scoped pattern scan also inspected first-party source across
all fetched Git revisions; historical vendored dependencies and binary assets
were excluded from that scan.

No production deployment, hosting-setting change, production database write,
credential upload, or merge into main was performed. All database writes in tests
used disposable MongoDB instances. Public hosting/API probes were read-only.

## Deployment investigation

GitHub Actions had **zero runs** and zero check runs for the base commit. Failures
were Vercel deployment statuses, not failed GitHub workflows.

The latest base commit has these GitHub-reported production deployment records:

| Project | GitHub deployment ID | Result | Vercel deployment ID |
| --- | --- | --- | --- |
| coders-hub | 7191837606 | failure | dpl_FC7ndk4M8zeo61SyfTV3UNENkYP7 |
| coders-hub-iioi | 7191833219 | failure | dpl_BvuupHpbj4iAMFMnEGY9bV9yBRKo |
| coders-hub-kwm9 | 7191836286 | success | dpl_DC8WKavJkxRT3ZXKhEF9k7NfCVvn |

Similar failures/successes occur on `4013d26` and `c3ffe61`. These records prove
status outcomes, not that application features worked.

Sources: [GitHub deployment records](https://api.github.com/repos/ankesh15/CodersHub/deployments),
[base commit statuses](https://api.github.com/repos/ankesh15/CodersHub/commits/5651a432f99c437871bba291dc5f10d15651f828/status).

The failed [coders-hub deployment](https://vercel.com/ankesh-singhs-projects/coders-hub/FC7ndk4M8zeo61SyfTV3UNENkYP7)
and [coders-hub-iioi deployment](https://vercel.com/ankesh-singhs-projects/coders-hub-iioi/BvuupHpbj4iAMFMnEGY9bV9yBRKo)
were inspected through the connected Vercel API. The account exposes team
`ankesh-singhs-projects` (`team_WMfI7leGWKUiCAguqjyWse7x`), but listing all its
projects returns an empty list. Both failed deployment event/log requests return
HTTP 404 `Deployment not found`; deployment-detail requests also return 404.
The dashboard initially required sign-in. The precise original build errors and
project settings therefore could not be recovered. A missing/deleted resource
or access limitation cannot be distinguished from these responses alone.

The missing evidence is the retained build logs and project settings for those
two Vercel deployments, plus Render service/deploy/runtime logs and its deployed
commit/root/start command. Render was not connected. GitHub repository access
was available and changes were implemented despite these evidence gaps.

A local frontend build of unchanged main **succeeded**. The repository root has
no package.json; running npm there fails ENOENT. That is a reproducible root
configuration constraint, **not proof of a historical hosting failure**. Exact
frontend/backend roots and environment requirements are in DEPLOYMENT.md.

Read-only checks against the existing successful Vercel deployment established:

- `/dashboard`: 200 HTML.
- `/result/alice.dev`: 404 plain text, matching the defective dot-excluding route.
- `/api/health` and `/api/auth/me` on that static frontend: 200 HTML; no API proxy.
- Its public compiled bundle explicitly uses
  `https://codershub-jxst.onrender.com/api`, so it does not depend on that missing
  frontend API proxy.
- The embedded Render host returns 401 JSON for `/api/auth/me`, but 404 HTML
  (`Cannot GET /api/health`) for `/api/health`. Current main defines that health
  route. This is evidence of a different/older running backend or entrypoint;
  which hosting setting caused it remains unknown without Render records.

## Confirmed repairs

1. **Dotted profile deep links failed on Vercel.** `src: /[^.]+` excluded dots
   even though profile validation permits them. Existing assets now take
   precedence, followed by a full SPA fallback to `/index.html`. Added routing
   regression assertions and a dotted-handle browser/print workflow.
2. **API destination normalization was unsafe.** Legacy `VITE_API_URL` values
   ending in `/api/` became `/api/api`. Whitespace and invalid/credential-bearing
   destinations were accepted, and an unset production destination silently
   compiled `/api` despite no host proxy. Normalize the legacy suffix once,
   validate the destination without printing its value, and require explicit
   production configuration. Local development still defaults to its proxy.
3. **Invalid startup could hang indefinitely.** Startup connected MongoDB before
   createApp rejected a weak production secret. Only exitCode was set, leaving
   sockets alive and no listening server. A regression child process reproduced
   the hang before the fix. Settings are now checked before connecting, and
   later startup/listen errors disconnect MongoDB and exit nonzero.
4. **Session-store initialization was not awaited.** The store creates its TTL
   index asynchronously. The expanded occupied-port regression exposed a
   cleanup race (`MongoExpiredSessionError`) while this initialization was still
   running. Startup now awaits store readiness before listening or cleaning up;
   store initialization failure cannot be mistaken for a usable persistent store.
5. **Production origins/OAuth could silently use localhost defaults.** Production
   now requires an HTTPS frontend origin, complete optional OAuth credentials,
   and an explicit HTTPS backend origin for OAuth. Invalid paths, credentials,
   queries and fragments are rejected. These are preventive configuration
   fixes; historical hosting environment values were not visible.
6. **Seven frontend dependency advisories.** Initial npm audit reported five high
   and two moderate findings through Tailwind 3's braces and selector-parser
   dependency chain. Nonbreaking audit fix did not remove the chain. The official
   Tailwind 4.3.3 upgrader migrated PostCSS, styles and utility names, removed the
   old JS configuration/autoprefixer, and regenerated the lockfile. Both final
   dependency audits report **zero vulnerabilities**. Tailwind's newer browser
   requirements are documented in DEPLOYMENT.md.
7. **Live smoke checks could falsely succeed.** The script logged provider
   failures but returned success as long as the missing-Codeforces-user check
   passed. Any failed provider/missing profile now sets a nonzero exit code.
   Its current CodeChef failure remains visible and honestly fails the command.
8. **Repeatability and documentation.** Added a production-assets browser config
   and GitHub CI checks, with no deployment step. Restored the missing audit
   document referenced by README and added exact manual hosting instructions.

## Verification results

Runtime: Node 22.22.1, npm 9.2.0, installed Google Chrome. Tests bind loopback
servers and use temporary MongoDB 8.2.6, never a configured production database.
Network/browser/process tests needed execution outside the restricted sandbox.

| Command/check | Actual final result |
| --- | --- |
| `npm --prefix backend ci` | Pass; lockfile install |
| `npm --prefix frontend ci` | Pass; clean migrated lockfile install |
| `npm --prefix backend run lint` | Pass; syntax checks, including new config and model |
| `MONGOMS_DOWNLOAD_DIR=/tmp/codershub-mongodb npm --prefix backend test` | 22 passed, 0 failed |
| `npm --prefix frontend run lint` | Pass; ESLint |
| `npm --prefix frontend test` | 7 passed, 0 failed |
| `VITE_API_BASE_URL=/api npm --prefix frontend run build` | Pass; compiled production assets |
| `npm --prefix frontend run test:e2e` | 4 passed on unchanged baseline |
| `npm --prefix frontend run test:e2e:production` | 4 passed after fixes/migration, compiled assets and real temporary database |
| `npm --prefix frontend run test:e2e:live` | 1 passed after migration, real external providers and populated PDF |
| `npm --prefix backend audit` | 0 vulnerabilities |
| `npm --prefix frontend audit` | 0 vulnerabilities; initially 7 |
| `node backend/test/platform-smoke.cjs` | Exit 1, correctly reporting unavailable CodeChef |
| Production build with both API variables removed | Expected exit 1 with an explicit configuration error |
| `git diff --check` | Pass |
| CI YAML | Parsed and manually reviewed; read-only GitHub permissions, no deployment action |

Backend coverage includes registration/password hashing, input validation and
injection rejection, private/public field separation, credential rejection,
session rotation/persistence/logout, authorized updates, atomic bookmarks,
OAuth identity collision safety, database outages, actual production startup,
weak-secret and occupied-port exits, HTTPS proxy cookie flags/CORS, and provider
response/error transformations. New provider contract tests use fixtures; the
separate live checks use actual network responses.

Production browser coverage includes registration, session restoration/reload,
edit validation, search/bookmarks/comparison/logout/login, mobile navigation,
dark mode persistence, missing profiles/routes, dotted profile printing, PDF
output, and layout at 375/768/1280px. Live browser screenshots were visually
inspected for dashboard charts, profile badges and Codeforces heatmap.

Live provider results on the final smoke run:

| Provider/check | Result |
| --- | --- |
| GitHub `octocat` | 200, 8 public repositories, no warnings |
| LeetCode `leetcode` | 200, 45 solves; calendar private/unavailable warning |
| Codeforces `tourist` | 200, 3,055 distinct solved problems, no warnings |
| Missing Codeforces handle | 404, expected |
| CodeChef `tourist` | App 502; direct upstream returned 402 `Payment required` |

Initial regression failures were observed before repair: three frontend
configuration/routing tests failed, and the invalid-production-startup child
failed to exit within three seconds. All final deterministic suites pass.
The large Vite JS chunk warning remains nonfatal (about 731 kB minified,
221 kB gzip); the build succeeds. No backend compilation script exists; the
backend is executed directly and its syntax/startup are tested.

Legacy `backend/test-db*.js`, `test-seq.js` and `test-api.js` are ad hoc probes
requiring a separately configured database/server. They were inspected but not
pointed at a live user database. Their equivalent database/API workflows were
verified in the isolated suite. Real GitHub OAuth provider sign-in was not
performed because provider credentials were not supplied.

## Security and remaining work

- Current tracked/source-history pattern scans found example MongoDB URLs and
  test placeholders, not a real database password, GitHub token, AWS access key
  or private key. This was a scoped scan, not a guarantee against every secret
  format. No local `.env` was supplied or read from a production host.
- Old commits contain a hardcoded **placeholder** session signing value, already
  removed from current main. Rotate the signing key and invalidate sessions on
  any installation that used it; no history rewrite or credential rotation was
  attempted without operator access.
- Failed deployment build causes cannot be asserted until the missing logs are
  recovered. Follow DEPLOYMENT.md to inspect/correct hosting configuration.
- The running Render backend does not match current main's health contract;
  inspect its deployment state. It was not redeployed here.
- CodeChef's paid/unavailable third-party endpoint needs an operator-selected
  supported provider. No replacement statistics or paid credentials were added.
- LeetCode may withhold calendars while exposing valid public solve counts;
  the warning is preserved. GitHub's recent-event timeline is not a complete
  yearly contribution history.
- The new GitHub workflow must be observed on GitHub to confirm its hosted run;
  local test success does not establish CI or deployment success.

## Files changed

The exact list below is generated from this branch's working diff. Changes to
React screen utilities are mechanical Tailwind migration adjustments.
- `.github/workflows/ci.yml`
- `AUDIT_REPORT.md`
- `DEPLOYMENT.md`
- `README.md`
- `backend/app.js`
- `backend/env.example`
- `backend/index.js`
- `backend/lib/config.js`
- `backend/package.json`
- `backend/test/app.test.js`
- `backend/test/config.test.js`
- `backend/test/platform-smoke.cjs`
- `backend/test/platforms.test.js`
- `frontend/.env.example`
- `frontend/package-lock.json`
- `frontend/package.json`
- `frontend/playwright.config.js`
- `frontend/playwright.production.config.js`
- `frontend/postcss.config.js`
- `frontend/src/About.jsx`
- `frontend/src/App.css`
- `frontend/src/App.jsx`
- `frontend/src/Compare.jsx`
- `frontend/src/Footer.jsx`
- `frontend/src/Form.jsx`
- `frontend/src/Header.jsx`
- `frontend/src/Landing.jsx`
- `frontend/src/Login.jsx`
- `frontend/src/Result.jsx`
- `frontend/src/Search.jsx`
- `frontend/src/Users.jsx`
- `frontend/src/components/HeatmapCard.jsx`
- `frontend/src/index.css`
- `frontend/tailwind.config.js`
- `frontend/test/browser/workflows.spec.js`
- `frontend/test/deployment.test.js`
- `frontend/vercel.json`
- `frontend/vite.config.js`
