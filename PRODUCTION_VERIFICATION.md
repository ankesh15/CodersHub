# CodersHub — production verification and repair

Date: 20 October 2026, Asia/Kolkata. Evidence timestamps below are UTC (add
05:30 for India time). Application source inspected: PR #1 commit
`c4042b4caa6f83cfadfb6684e4bc5af49a97dbb9`, based on main
`5651a432f99c437871bba291dc5f10d15651f828`. This report accompanies a verifier/docs
follow-up on the same working branch; the final PR head is recorded in the
completion report, because a Git commit cannot contain its own SHA.

## A. Executive summary

**Production is partially working, with directly verified integration and
privacy failures. It is not production-verified as a complete application.**

The Vercel frontend serves its shell/assets and references the intended HTTPS
Render API. The PR preview fixes dotted-profile routing. However, both deployed
frontends use a Render backend still running a June commit. That backend sends
credentialed CORS responses for localhost instead of the Vercel origin, lacks
current source's `/api/health`, exposes private fields in public responses, and
uses older provider/error-handling code. Production search and the deployed
preview leaderboard fail in the browser. Passing local/CI checks do not establish
production success.

No real user data was created, modified or deleted. No production environment
variable, hosting setting, deploy, restart, rollback, or PR merge was performed.
Only sanitized field names/counts and log excerpts were retained.

## B. Vercel verification

Authenticated identity: username `ankesh15`, user ID `8ifRvjmEBrACn949J7hbjG20`.
The listed team is `ankesh-singhs-projects`,
`team_WMfI7leGWKUiCAguqjyWse7x`, matching GitHub's Vercel bot metadata.

The authenticated project list remains empty. Direct lookups by the exact
project IDs reported by the bot return HTTP 404 `Project not found`. Deployment
lookups and failed-build event requests also return HTTP 404. No inference that
the projects do not exist is justified: GitHub has fresh statuses and the
successful preview URL serves the application.

### Project/deployment evidence

| Project | Project ID from bot | Root from bot metadata | PR c4042b4 status/deployment |
| --- | --- | --- | --- |
| coders-hub | prj_D40111mufggwmAhEDQSVwA30rgI2 | null/repository root | FAIL — dpl_2a1xyN9s6kHUyY66t6Y6UTWxyVMv |
| coders-hub-iioi | prj_sysgr1zC5xXqabHO9Qbi2kM94evr | null/repository root | FAIL — dpl_r5qDem5vSjhBUGQJNX2rtDzaLLd1 |
| coders-hub-kwm9 | prj_FIW2YM58aKJB2mtZSDpLQ9gvHj4y | frontend | READY — dpl_73as4JFuadydRKrQmADtJHAHLv1A |

These are Vercel statuses, separate from the passing GitHub Actions check. Bot
updates are dated 2026-10-20T05:28:07Z. The null roots conflict with the repository's
lack of a root package.json, but unavailable build logs prevent calling that the
proven cause of either failed build.

GitHub also records production failures for main 5651a43:
`dpl_FC7ndk4M8zeo61SyfTV3UNENkYP7` and
`dpl_BvuupHpbj4iAMFMnEGY9bV9yBRKo`; corresponding successful production deployment:
`dpl_DC8WKavJkxRT3ZXKhEF9k7NfCVvn`. Their logs were previously inaccessible and
remain unavailable through the connected account.

Observed production URL:
`https://coders-hub-kwm9-as1zteu3c-ankesh-singhs-projects.vercel.app`.
Observed PR preview URL:
`https://coders-hub-kwm9-git-fix-deploymen-0e7158-ankesh-singhs-projects.vercel.app`.
These were obtained from GitHub deployment records/bot metadata, not guessed.
Production-branch configuration and canonical custom/alias domains could not be
read from Vercel; the production label/SHA comes from GitHub's deployment record.

At 06:06Z, both URLs returned 200 HTML for `/` and `/dashboard`, served JavaScript
assets, and their compiled bundle contained
`https://codershub-jxst.onrender.com/api`. Production returned 404 for
`/result/verification.profile`; the PR preview returned 200 HTML, directly
verifying the routing repair on the preview. That does not prove profile data
loads: the preview's browser displays a backend/profile error.

Vercel build/install/output/framework settings, Preview/Production variable
presence, build logs, runtime logs and project permissions are **BLOCKED** by
resource visibility. An explicit environment metadata request with decryption
disabled also returned HTTP 404 `Project not found`; no values were requested
in decrypted form or printed. The repository specifies Vite, `npm ci`, `npm run build`,
`dist`, and a `frontend` project root. An incorrect deployment ID is not assumed:
IDs and inspector URLs were taken directly from current GitHub statuses and
queried using the matching listed team. Account/team identity matches, but
project-level access versus deleted/hidden resources cannot be distinguished
from 404 responses alone.

## C. Render verification

The user confirmed `Ankesh's workspace`, `tea-d8l4becvikkc73ccosrg`, before scoped
resource reads. The connected account lists the intended resource:

| Setting | Authenticated observation |
| --- | --- |
| Service | CodersHub |
| ID | srv-d8ldqtpkh4rs73ee56eg |
| URL | https://codershub-jxst.onrender.com |
| Dashboard | https://dashboard.render.com/web/srv-d8ldqtpkh4rs73ee56eg |
| Repository | https://github.com/ankesh15/CodersHub |
| Branch/root | main / backend |
| Runtime/plan/region | node / free / oregon |
| Build/start | npm install / npm start |
| HTTP health path | empty; TCP default applies |
| Auto-deploy | yes; trigger commit |
| PR previews | off |
| Suspension/maintenance | not_suspended / disabled |

Only one deploy was returned; the next history page was empty:
`dep-d8ldqu1kh4rs73ee56o0`, status `live`, trigger `manual`, commit
`eb21bccfb54df99b4ebd960fc97a184324239db0`, created
2026-06-11T16:08:24Z and finished 16:09:15Z. Authenticated get-deploy confirms the
same SHA. It is not current main and not the PR commit.

Events show successful initial build/deploy. No later failed deployment record
was returned. Why newer main commits did not cause deploy records is still
unverified; do not claim a broken webhook, disabled setting or build failure
without evidence. The displayed auto-deploy setting alone does not prove Git
provider integration is functioning.

Sanitized runtime evidence:

```text
2026-10-20T05:39:36Z  Running 'npm start'
2026-10-20T05:39:37Z  > node index.js
2026-10-20T05:39:41Z  Attempting to connect to MongoDB with URI: [REDACTED]
2026-10-20T05:39:42Z  Server is running on port 10000
2026-10-20T05:39:44Z  MongoDB Atlas connection established successfully.
```

Repeated startup entries do not establish a crash loop. Error-level logs for
October 19–20 returned an empty result, and no failure event was found in the
returned history. The endpoint responds now; it is not currently suspended.
October build logs were empty. The June build lies outside the log API's
30-day query window; initial success is established by events/deploy status.

Observed URI log entries had masked passwords. The entire URI was redacted from
our retained excerpts. No secret value was printed or committed. Current source
uses generic connection logs and does not print the URI.

**Why health differs:** authenticated deployed SHA and its source prove the old
entrypoint defines only `GET /`, with no `/api/health`. GET `/` is 200; GET
`/api/health` is 404 HTML (`Cannot GET /api/health`). Current main/PR defines
readiness JSON at `/api/health`. The root directory/start command are correct;
stale deployed code explains this mismatch.

Environment-variable names/values and exact running Node version were not
exposed by the available read-only MCP tools. No Render CLI/API-key login is
configured, and the dashboard redirects to sign-in. The mutation-only env tool
was not used to inspect or rewrite variables. MongoDB connectivity establishes
that a usable URI is available at runtime, but does not identify which alias or
prove every required secret is configured. No database migration is defined in
this application; no production database was queried directly or modified.

## D. Integration verification

Flow: browser → Vercel JS → HTTPS Render `/api` → MongoDB/public providers.
The API reference is HTTPS and ends in `/api`, with no mixed-content URL seen in
the compiled configuration. JavaScript/assets load on both deployed frontends.

At 05:45–05:46Z and in the independent 06:06Z verifier:

| Request | Direct result | Browser implication |
| --- | --- | --- |
| GET /api/auth/me | 401 JSON | Correct guest status, but browser cannot read it because CORS origin is wrong |
| OPTIONS /api/auth/login or /api/user, Vercel Origin | 204 with allow-origin http://localhost:5173, credentials true | FAIL; a 204 alone is not a successful browser preflight |
| GET /api/users | 200 JSON, two records | Database-backed reads work; response includes email and bookmarks field names |
| POST /api/user for existing public handle | 200 JSON | Same private-field exposure; lookup is read-only |
| GET /api/health | 404 HTML | No readiness/database contract on running old code |

No email/bookmark values were printed or retained. Public-field exposure is a
confirmed production privacy defect, already excluded by current source's
`publicFields` selection and its regression tests. The stale deployment still
runs an older route that only omits password. Updating the reviewed source is
required; adding duplicate filters to already-correct source does not repair the
running old service.

The deployed old CORS code uses `FRONTEND_URL || http://localhost:5173`. Headers
prove the active origin is localhost. They cannot distinguish an absent variable
from one explicitly set to localhost. The source already validates an explicit
HTTPS production origin; no wildcard/credential protection was weakened.

The actual preview browser displays session-restore failure and unavailable
leaderboard/profile states. Production search remains on the search page after
a request for an existing handle. The response-origin mismatch directly explains
why browser requests fail even while direct non-browser API probes return data.

Provider probes against the **production backend** at 05:47Z:

| Provider | Production result |
| --- | --- |
| GitHub octocat | 200; profile present |
| LeetCode leetcode | 404; old generic 'user not found or API error' response |
| Codeforces tourist | 200; profile present |
| CodeChef tourist | 404; old generic 'user not found or API error' response |

Direct CodeChef upstream recheck returned HTTP 402, `Payment required`,
`DEPLOYMENT_DISABLED`. Therefore there are two distinct issues: the provider is
unavailable, and deployed old code misclassifies upstream failures as user 404s.
Current repository code reports this upstream failure as 502 and its tests cover
that mapping. The provider was not fixed or replaced.

Current code's LeetCode integration succeeds in the separate local live browser
check; production's 404 cannot be treated as evidence the handle does not exist.
Its upstream failure/error mapping differs from current source. The deployed
route first requires `leetcode-stats-api.herokuapp.com` before trying official
GraphQL; a direct probe of that exact legacy endpoint timed out after 20 seconds.
The old catch maps every such failure to a user 404. The precise Render-side
upstream exception was not logged, so its exact network error is not asserted.
Current source removes that mandatory third-party dependency. Private calendar
warnings remain explicit in the current integration.

Production login, cookie persistence/rotation, protected writes and full OAuth
sign-in were **NOT TESTED** because no real user data may be changed. The old
source hardcodes a localhost OAuth callback; this is unsuitable for production.
Current source derives the HTTPS callback from validated configuration. Actual
provider credential presence and a successful provider sign-in remain BLOCKED.
The frontend uses a 45-second API timeout (10 seconds for initial session
restoration), and provider requests use 10-second per-request backend timeouts.
There is no automatic retry in the inspected frontend hook; it exposes a manual
refresh. Timeout-to-504 mapping and provider failures are tested locally. No production load/rate-limit
stress test was performed; request volume was deliberately small.

## E. Test results by environment

| Environment | Check | Result |
| --- | --- | --- |
| Local | Backend syntax checks | PASS |
| Local | Backend tests after verifier addition | PASS — 28 tests |
| Local | Frontend ESLint and unit/config tests | PASS — 7 tests |
| Local | Production build, explicit API configuration | PASS — existing nonfatal large JS chunk warning |
| Local | Production-assets Playwright workflows | PASS — 4 tests, 30.7 seconds |
| Local, live upstream providers | Existing live browser integration | PASS — 1 test, 19.5 seconds; temporary MongoDB/user only |
| Local | Both dependency audits | PASS — zero vulnerabilities |
| GitHub Actions | Application checks for c4042b4 | PASS — run 39375043816 |
| PR Vercel preview | coders-hub-kwm9 build status | PASS — Ready according to bot/status |
| PR Vercel preview | Static routes/assets/compiled API reference | PASS, including dotted route |
| PR Vercel preview | GET/OPTIONS deployment verifier | FAIL — shared Render health/CORS/privacy contracts |
| PR Vercel preview | Browser leaderboard/profile data | FAIL — unavailable backend states |
| Production Vercel | Shell/assets/API reference | PASS |
| Production Vercel | Dotted route refresh | FAIL — HTTP 404 |
| Production integration | GET/OPTIONS deployment verifier | FAIL — exit 1 at 06:06:04Z |
| Production Render | Process/database-backed reads | PASS — runtime logs and 200 public lookups |
| Production Render | /api/health, CORS, public-field privacy | FAIL |
| Production providers | GitHub and Codeforces direct API | PASS |
| Production providers | LeetCode and CodeChef direct API | FAIL — 404 generic mapping |
| Direct upstream | CodeChef | FAIL — 402 DEPLOYMENT_DISABLED |
| Production authentication/OAuth/writes | No authorized test user/write flow | NOT TESTED / credential verification BLOCKED |
| Deployed mobile breakpoint | Requested browser override still reported 1265px | NOT TESTED reliably at 375px; local 375/768/1280 checks pass |
| Vercel control plane | Exact settings/env names/build/runtime logs | BLOCKED — resource 404s despite matching identity/team |
| Render environment names/exact Node version | No authenticated read surface | BLOCKED |

The hosted verifier uses GET/OPTIONS only and reports field names/counts, not
user values. The production and preview failures are expected detections, not
failed local regressions. Its fixture tests verify healthy hosts pass and the
observed CORS, private-field, HTML-health and dotted-route failures fail.

Actual deployed chart/badge/PDF success is not claimed: browser data loading is
blocked. Those workflows pass in local production-assets/live-upstream tests,
which are labeled separately. Responsive production shell fits the observed
desktop viewport; the unsuccessful mobile override is not counted as a pass.

## F. Fixes implemented

The existing PR's routing/startup/API-validation/Tailwind fixes were preserved.
Its complete 38-file change list and earlier regression evidence remain in
AUDIT_REPORT.md. This follow-up adds an operational verification repair rather
than pretending to patch a deployed service without release authorization.

| File | Change | Verification |
| --- | --- | --- |
| backend/verification/deployment.js | Read-only deployed contract checks; sanitized results and explicit overall failure | Five scenario tests over real temporary HTTP servers |
| backend/test/deployment-smoke.cjs | CLI runner; exits 1 for any failed hosted contract | Actual preview and production each exit 1 |
| backend/test/deployment.test.js | Reproduces observed CORS/privacy/readiness/routing defects; proves only GET/OPTIONS and no private values in results | Backend suite: 28 passing tests |
| backend/package.json | test:deployment script and expanded syntax checks | Lint/tests pass |
| DEPLOYMENT.md | Exact confirmed Render state, safe configuration/release order and deployed-check command | Compared to authenticated service/deploy/log records |
| README.md | Explicit separation of local/CI and hosted verification | Command executed against both environments |
| PRODUCTION_VERIFICATION.md | This evidence report and exact remaining manual actions | Sanitized observations and source/record comparison |

No runtime security control was disabled, no private credential was added, and
no fabricated API success was introduced. Production defects already repaired
in current main/PR still require an authorized release/configuration update.

## G. Manual actions required

1. **Restore Vercel project visibility.** Sign in as ankesh15, switch to
   `ankesh-singhs-projects`, and open the exact project/inspector links in PR #1's
   Vercel bot comment. Confirm project-level access for the connected integration.
   Reconnect with the intended account/team/project access if necessary. If the
   records were removed, recover/export retained logs. Do not conclude deletion
   from a 404 alone. Provide logs/settings, never tokens or secret values.
2. **Confirm intended Vercel projects.** For coders-hub-kwm9 retain frontend root,
   Vite, npm ci, npm run build and dist. Inspect the two failed projects' purpose
   and root/build commands; bot metadata says repository root. If intended as
   frontend projects, correct their root to frontend only after reviewing logs.
   Do not delete or repurpose projects merely because their builds failed.
3. **Inspect Vercel variables separately.** In each intended project's settings,
   check Preview and Production variable presence. Keep VITE_API_BASE_URL as the
   intended HTTPS backend including /api; never put secrets in VITE_* variables.
   The current compiled production/preview bundles reference the observed Render
   API, but dashboard variable presence/overrides remain unverified.
4. **Inspect Render service settings privately.** Open
   https://dashboard.render.com/web/srv-d8ldqtpkh4rs73ee56eg in the confirmed
   workspace. Keep the verified repository/main/backend/npm start settings.
   Check Git provider connection/authorization and why no deploy followed newer
   commits. Prefer a locked npm ci --omit=dev install command for production and
   select a supported tested Node version (22.22.1 was tested); current exact
   runtime version is unknown. No setting was changed here.
5. **Inspect Render Environment without disclosing values.** Verify NODE_ENV is
   production, a valid private MONGO_URI or MONGODB_URI exists, SESSION_SECRET is
   stable and strong (32+ characters), and FRONTEND_URL equals the intended
   canonical public HTTPS frontend origin. Inspect optional OAuth keys and
   BACKEND_URL privately. Do not paste values into chat or logs. The observed
   active CORS origin is localhost and must be corrected through an explicitly
   authorized configuration/release operation.
6. **Authorize code release separately.** Review PR #1 and its checks. Only after
   explicit approval should the reviewed changes be merged/deployed. Verify the
   Render deploy's actual SHA, rather than restarting the June commit. A restart
   of the old deploy cannot incorporate source fixes. Production release and
   environment changes were not authorized by this task and were not performed.
7. **Set HTTP health only after the new code is live.** First verify /api/health
   returns 200 JSON with database connected; then configure that path in Render's
   Health Checks settings. Setting it now would target a missing route. Re-run
   the read-only verifier and inspect runtime errors after the authorized deploy.
8. **Separate Preview from Production.** Render PR previews are currently off.
   Configure a dedicated preview backend/origin if hosted preview workflows must
   pass independently. Do not allow arbitrary origins or wildcard credentialed
   CORS. Update Preview API configuration only through an authorized action.
9. **Verify authentication after release.** Use an explicitly authorized test
   account, verify secure HttpOnly cookies over HTTPS and persistence, and check
   the registered OAuth callback is `<BACKEND_URL>/api/auth/github/callback`.
   Do not test by creating or editing real users. Review cross-site-cookie policy
   and use same-site domains/proxying if browser policy requires it.
10. **Resolve external CodeChef separately.** The current upstream is disabled
    with HTTP 402. Choose an available supported provider or document it as
    unavailable; do not add paid credentials or fabricated statistics. Recheck
    provider success before describing it as repaired.
11. **Review historical signing secrets.** If a deployment used the historical
    fallback/placeholder signing key, rotate it and invalidate sessions in an
    authorized operation. Observed MongoDB log passwords were masked; no live
    database secret exposure is asserted from these sanitized logs.

## H. Final status labels

- **PASS — directly verified:** current local tests/build/audits; earlier GitHub
  Actions; live preview dotted routing/assets; direct production root/profile
  reads; runtime MongoDB connection; service/repository/deployed-SHA identity.
- **FAIL — directly verified:** production dotted routing; hosted browser data
  workflows; both frontends' backend CORS/readiness/privacy contracts; production
  LeetCode/CodeChef responses; two PR Vercel project statuses; CodeChef upstream.
- **BLOCKED — missing access/credentials:** exact Vercel project settings/env/logs,
  failed-build root causes; Render env-key inventory and exact Node version;
  provider credential presence; release/configuration actions awaiting explicit
  authorization. A connected account is not proof of access to every resource.
- **NOT TESTED:** real production login/OAuth/protected writes, deployed populated
  chart/PDF success, reliable deployed mobile viewport, load/rate-limit stress.

## I. PR status

PR #1: https://github.com/ankesh15/CodersHub/pull/1.
Branch: `fix/deployment-and-application-audit`; main was not changed.
The inspected application commit c4042b4 is a draft PR and its GitHub Actions
run passed. Its Vercel project statuses are separately two failures and one Ready.
This report/new smoke verifier are a follow-up on that same branch. Final
follow-up SHA and resulting CI status are recorded in the completion report.
No production deploy or merge was performed. Existing automatic Vercel previews
may build branch updates; they are not a production release.

## References and evidence location

- [PR #1](https://github.com/ankesh15/CodersHub/pull/1), including Vercel bot deployment links.
- [GitHub Actions run for the audited application commit](https://github.com/ankesh15/CodersHub/actions/runs/39375043816).
- [Render deploy lifecycle](https://render.com/docs/deploys) and [health checks](https://render.com/docs/health-checks), read from current Markdown references.
- [Render MCP capabilities](https://render.com/docs/mcp-server), including its limited configuration surface.

The downloadable completion artifacts include sanitized HTTP evidence and browser
screenshots. No raw user records, database connection strings, authentication
cookies, secrets, or raw credential-bearing logs are included.
