# HockeyPickup.App — Repo Conventions

## Stack
React + TypeScript (STRICT), Mantine UI, yarn, ESLint 10, Azure Static Web Apps (`staticwebapp.config.json` owns headers/CSP).

## Hard rules
- **Arrow functions only.** Never `function()` declarations or expressions — components, handlers, utilities, everything: `const MyComponent = (): JSX.Element => { ... }`.
- **Strict typing everywhere.** No `any`, no implicit returns of `any`, no `@ts-ignore`. Type all props, API responses, and event handlers explicitly. API response types must match the Api's response models field-for-field (PascalCase JSON property names per the Api's `JsonPropertyName` attributes).
- Mantine components for all UI; match the existing component composition, theming, and form patterns in the codebase. No new UI libraries.
- yarn only (`yarn add`, `yarn install`) — never npm.
- State for server data follows the existing data-fetching pattern in this repo (inspect before adding; do not introduce a new fetching library).
- `FormData` uploads: never set `Content-Type` manually.

## Patterns
- API calls go through the existing typed API service layer; add new endpoints there, not inline `fetch` in components.
- Enums mirrored from the Api (e.g., `BuyActionState`) are defined once in the shared types module and imported — never re-declared locally.
- Time display: session/window times are Pacific; follow existing date-formatting utilities.
- Run `yarn lint` and `yarn build` before declaring any task complete; fix all errors and new warnings.

## Visual Verification Workflow

**Run this for every front-end change, automatically — do not wait to be asked.** A change is not
done until it has been rendered in a real authenticated browser and visually compared before/after.

| Command | Purpose |
| --- | --- |
| `yarn auth` | One-time interactive login; saves `storageState` to `.auth/state.json` |
| `yarn verify:visual --expect "<text>" --out "<name>"` | Pre-flight auth check + assert + screenshot |

### Services

```bash
# Api — MUST be the https profile; Vite proxies /api -> https://localhost:7042
cd HockeyPickup.Api/HockeyPickup.Api && dotnet run --launch-profile https
# App
cd HockeyPickup.App && yarn dev            # https://localhost:5174 (basicSsl, self-signed)
```

Poll both with `curl -k` until they respond (60s cap) — never a fixed sleep. If either fails to
start, stop and show the user the error; do not proceed.

### Auth gate — non-negotiable

- Every Playwright context is created with `{ storageState: '.auth/state.json' }`.
- If `.auth/state.json` is **missing**, STOP and tell the user to run `yarn auth`
  from `HockeyPickup.App` with services running.
- If the pre-flight says the session is **expired**, STOP and report
  `auth expired — re-run: yarn auth`.
- **Never** ask the user for credentials, never script a login, never work around the gate.
- `.auth/state.json` holds a live bearer token: never commit it, never print its contents.
  `.auth/` and `screenshots/` are gitignored and are never staged.

### Pre-flight check — required before any assertion

Never assert against a page that might be unauthenticated. `verify-visual.ts` loads `/sessions`
(a `ProtectedRoute`) and races the authenticated marker (`Upcoming Sessions` heading) against the
login marker (`Welcome Back` heading), and confirms the URL did not land on `/login`. Redirect,
wrong page, or timeout all fail closed with the auth-expired message. Only then does it assert.

### The loop

```bash
cd HockeyPickup.App
yarn verify:visual --expect "About"    --out "before-<slug>"   # 1. before
# 2. read the screenshot with your own vision — confirm it shows what you expect
# 3. make the change (minimal diff)
yarn verify:visual --expect "Aboutttt" --out "after-<slug>"    # 4. after (HMR is instant)
# 5. read the after screenshot, compare to before: intended change visible AND nothing else
#    regressed (layout, styling, surrounding elements)
# 6. give the user both file paths + a one-line summary of what changed visually
# 7. yarn lint && yarn build, then commit on a feature branch. NEVER push.
```

Optional flags: `--path /about` (page under test, default `/`) and `--focus <selector>` (element
close-up, default `footer`). The pre-flight always runs on `/sessions` regardless of `--path`, so
data-heavy routes don't produce an unreadably tall full-page screenshot.

Each run writes two files to `../screenshots/`: `<out>.png` (full page) and `<out>-focus.png`
(cropped to the changed region — this is the one that makes the diff legible at a glance).

**Git Bash mangles leading-slash args** (`--path /about` becomes `C:/Program Files/Git/about`).
Prefix the command with `MSYS_NO_PATHCONV=1`, or rely on the defaults.

Both commands are yarn scripts backed by the local `tsx` dev dependency — per the yarn-only rule,
never invoke them with `npx`/`npm`.

### Script rules

`capture-auth.ts` and `verify-visual.ts` follow the same hard rules as `src/`: **strict TypeScript,
arrow functions only, no `any`**. They are registered in `tsconfig.node.json` so they are
type-checked and covered by typed ESLint — a root-level `.ts` outside every tsconfig is a hard lint
error. Assert text with `{ exact: true }`: a substring match lets the old value satisfy the new
assertion (`About` matches `Aboutttt`) and the check silently passes for free.
