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
