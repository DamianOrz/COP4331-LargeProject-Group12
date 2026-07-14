# Frontend Automated Test Results

Date: July 14, 2026
Test Environment: Vite React frontend, Vitest 4.1.10, React Testing Library, and jsdom

## Command

`npm.cmd run test`

## Results

Test files: 3 passed
Tests: 10 passed

- Registration required-field validation: PASS
- Registration password mismatch validation: PASS
- Login required-field validation: PASS
- Logged-out protected-route redirect: PASS
- Valid JWT protected-route access: PASS
- Expired JWT cleanup and session-expired redirect: PASS
- Login API request and JWT user decoding: PASS
- Recipe list API authentication and filter contract: PASS
- Weekly meal-plan API authentication and request contract: PASS
- API error propagation to protected pages: PASS

## Build Checks

- `npm.cmd run build`: PASS
- `npm.cmd run lint`: PASS

## Notes

- These automated frontend tests supplement the manual API-backed acceptance results in `docs/frontend-api-test-results.md`.
- API calls are isolated with mocked `fetch` responses so request payloads, JWT handling, and error behavior are deterministic.
- Browser acceptance tests against the real Express API and MongoDB Atlas remain documented separately.
