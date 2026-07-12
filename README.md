# Specimen Check-In — Frontend (Angular)

Angular replica of the Check-In screen design reference from the assignment brief.
Talks to the ASP.NET Core backend (separate repo/deploy) over a plain REST API.

> The brief calls for Vue.js; this was built in **Angular** instead per your instruction
> — Angular and React are both explicitly accepted per the JD, so this is a deliberate,
> documented substitution, not an oversight. Worth a one-line callout in your submission
> email so it doesn't read as "didn't read the brief."

> ⚠️ Same caveat as the backend: this sandbox has Node/npm but no internet access, so
> `npm install` has never actually been run against this code. The structure and
> versions are standard `ng new` output (Angular 17.3, standalone components) and
> everything here is written carefully, but **run `npm install && npm start` first**
> and fix anything npm surfaces before you assume it's done.

## What's implemented

Matches the design reference: a manifest worklist on the left (searchable, status
pills, received/discrepancy counts per card) and a manifest detail panel on the right
(status pills, running counts, specimen table, receive/flag actions, off-manifest
specimen dialog, close button gated on reconciliation).

- Loading state (skeleton cards in the worklist, spinner in the detail pane)
- Empty state ("Select a manifest to begin", and "no specimens on this manifest")
- Error path: any failed action surfaces a dismissible banner with the backend's own
  error message (e.g. attempting to close an unreconciled manifest shows the exact
  422 message the API returned)
- Live counts and "ready to close" state, driven entirely by what the API returns
  after each action — no client-side recomputation of business rules
- A dev-mode lab switcher in the top bar (stands in for login, per the brief's
  "no auth infra" scope note) — flip between the two seeded labs and watch the
  worklist swap entirely, which is the easiest manual way to eyeball tenant isolation
  from the frontend side

Not implemented (per the brief, section 8): Scan History / Manifests / Discrepancies
tabs are shown but inert — the brief says to skip them.

## Running locally

**Prerequisites:** Node 18+, the backend running locally (see backend README).

```bash
npm install
npm start
```

Opens on `http://localhost:4200`. `proxy.conf.json` forwards `/api/*` calls to
`http://localhost:5080` (adjust the `target` in that file if your backend runs on a
different port — check the console output when you `dotnet run` the backend).

## Connecting to your deployed backend

Before building for production, set your Railway backend URL in
`src/environments/environment.production.ts`:

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-backend.up.railway.app'   // no trailing slash
};
```

Then build:

```bash
npm run build:prod
```

Output lands in `dist/specimen-checkin-frontend/browser/`.

## Deploying

Any static host works (Vercel, Netlify, Railway static site, Azure Static Web Apps,
GitHub Pages). The general flow:

1. `npm run build:prod` (with `apiBaseUrl` already pointed at your deployed backend).
2. Deploy the contents of `dist/specimen-checkin-frontend/browser/` to your static host.
3. **Copy the resulting frontend URL** (e.g. `https://your-frontend.vercel.app`).
4. Back in the **backend**, add that URL to CORS so the browser is allowed to call it:
   - Locally: edit `appsettings.json`'s `Cors:AllowedOrigins` array.
   - On Railway: set the environment variable
     ```
     Cors__AllowedOrigins__0=https://your-frontend.vercel.app
     ```
     (double underscore is ASP.NET Core's env-var syntax for nested config), then
     redeploy/restart the backend service.
5. Reload the frontend — API calls should now succeed instead of failing on CORS.

Until step 4 is done, you'll see a CORS error in the browser console when the deployed
frontend calls the deployed backend — that's the backend's `Cors:AllowedOrigins` empty
list working as intended (see backend README, "CORS: off by default").

## Design notes

Colors, spacing, and component shapes were derived directly from the Check-In screen
screenshot embedded in the assignment document (dark navy top bar `#1B3A52`/`#20445E`,
light gray page background `#F5F6F8`, white cards, pill-shaped status badges, mono font
for manifest/specimen codes). Tokens live in `src/styles.css` as CSS custom properties
so the palette is centralized and easy to tune if you compare side-by-side with the
reference and want to nudge anything.

## Project structure

```
src/app/
  app.component.*              Top bar (brand, tabs, dev-mode lab switcher)
  core/
    models.ts                  TS interfaces mirroring the backend's DTOs exactly
    api.service.ts              HttpClient wrapper - attaches X-Lab-Id, normalizes errors
    tenant.service.ts          Holds "current lab" (dev-mode auth stand-in)
  features/checkin/
    checkin-page/               Owns all state; composes worklist + detail; wires the API
    manifest-worklist/          Left sidebar: searchable manifest cards
    manifest-detail/            Right panel: header, counts, specimen table, actions
    status-pill/                Shared status badge (manifest + specimen statuses)
    add-specimen-dialog/        Modal for recording an off-manifest specimen
```

State is intentionally centralized in `CheckinPageComponent` (Angular signals, no NgRx/
store library) — the assignment explicitly favors boring, clear code over premature
abstraction, and this app has exactly one screen's worth of state.
