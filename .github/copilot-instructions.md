# GitHub Copilot instructions for mygomi-frontend 🔧

Purpose: give AI coding agents the minimum, high-value knowledge to be immediately productive in this frontend repo.

## Quick snapshot ✅
- Tech: React (Create React App, TypeScript), `react-router-dom` (v7), `react-leaflet`/Leaflet, `@tanstack/react-query`, `axios`, `fullcalendar`.
- Dev scripts: `npm start`, `npm test`, `npm run build` (see `package.json`).
- File layout to know: `src/pages/`, `src/components/`, `src/api/` (empty), `src/hooks/` (empty), `src/assets/`, `frontend_libraries.md` (detailed library guidance).

## What matters for changes & features 💡
- Routing: top-level routes are declared in `src/App.tsx` using `<BrowserRouter>`, `Routes` and `<Route />` (see `HomePage` and `SharingPage`).
- Server data: most components currently use hard-coded mock data (e.g. `SharingPostList`, `Map`). Replace mocks by creating API clients under `src/api/` and fetching with React Query.
  - Recommended pattern (example): create `src/api/share.ts` with an axios instance (baseURL from `process.env.REACT_APP_API_URL`) and interceptors for auth/errors.
  - Wrap the app with a `QueryClientProvider` (see `frontend_libraries.md` for example) before using `useQuery`/`useMutation`.

## Project-specific patterns & conventions 🔍
- CSS: components use co-located `.css` files (e.g. `Header.css` alongside `Header.tsx`). Keep this pattern when adding styles.
- Components: functional components typed as `React.FC`, default exports.
- Map: `src/components/Map.tsx` sets Leaflet icons programmatically (delete and merge options) — do not remove that, it fixes icon loading.
- Localized strings: UI text is primarily Korean (with some Japanese examples). Preserve existing language usage or add an i18n plan explicitly.

## Integrations & libraries to be careful with ⚠️
- react-query is installed but not yet wired globally; the repo includes `frontend_libraries.md` that shows QueryClient setup and common usage examples — use that as canonical guidance.
- MSW is listed in devDependencies but no mock setup exists yet. If adding request mocks for tests, place them under `src/mocks` and wire them in test setup (or `src/setupTests.ts`).
- WebSocket libs (`@stomp/stompjs`, `sockjs-client`) are included but currently unused — look for planned real-time features before adding a new socket-based state flow.

## Tests & linting 🧪
- Testing: React Testing Library is configured in `devDependencies`. Existing tests may be stale (e.g. `src/App.test.tsx` asserts `/WORKOUT/i`) — update tests to reflect current UI.
- Formatting & hooks: `prettier`, `eslint`, `husky`, `lint-staged` are devDependencies. There is no visible repo-level husky/lint-staged config — do not assume pre-commit hooks exist unless you add them.

## When you change behavior — concrete checklist ✔️
1. Replace component mock data (e.g. `SharingPostList` / `Map`) with an API call via `src/api/*` and `useQuery`. Invalidate cache with `useQueryClient()` on mutations.
2. Add or update unit tests using `@testing-library/react`. If adding network tests, prefer MSW for stable mocks.
3. Preserve Leaflet icon adjustments in `Map.tsx` when changing map code.
4. Keep component-local `.css` naming and avoid global style changes unless intentional.
5. Run `npm start` and `npm test` locally to confirm behavior. Update `README.md` if you change major developer workflows.

## Useful references in repo 📚
- `frontend_libraries.md` — canonical examples for Axios, React Query, FullCalendar, and Leaflet snippets.
- `src/pages/HomePage.tsx`, `src/pages/SharingPage.tsx` — page layout and where to plug APIs.
- `src/components/Map.tsx`, `src/components/SharingPostList.tsx` — examples of mock data to swap for server-driven data.
- `src/setupTests.ts` — place to wire MSW test workers if needed.

---
If any instruction is unclear or you want more examples (e.g., a boilerplate `src/api/share.ts` + `useQuery` example wired into `App`), tell me which part to expand and I'll iterate. ✨