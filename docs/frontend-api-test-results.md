# Frontend API Acceptance Test Results

Date: July 14, 2026
Test Environment: Vite React frontend, Bun 1.3.14 Express API, MongoDB Atlas, and headless Microsoft Edge

## Results

Backend starts and connects to MongoDB Atlas: PASS
Register through Express API: PASS
Login and JWT session storage: PASS
Logout clears JWT and returns to login: PASS
Expired JWT redirects to `/login?session=expired`: PASS
Recipe create through API: PASS
Recipe details load through API: PASS
Recipe edit through API: PASS
Recipe delete through API: PASS
Recipe search through API: PASS
Weekly plan loads through API: PASS
Weekly assignment save: PASS
Weekly assignment replacement: PASS
Weekly assignment removal: PASS
API loading state: PASS
API error state: PASS
Mobile `/app` at 390x844 without horizontal overflow: PASS
Mobile `/app/recipes` at 390x844 without horizontal overflow: PASS
Mobile `/app/planner` at 390x844 without horizontal overflow: PASS

## Screenshots

- `docs/screenshots/api-dashboard-desktop.png`
- `docs/screenshots/api-recipe-details-desktop.png`
- `docs/screenshots/api-planner-desktop.png`
- `docs/screenshots/api-dashboard-mobile.png`
- `docs/screenshots/api-recipes-mobile.png`
- `docs/screenshots/api-planner-mobile.png`

## Notes

- All recipe and meal-plan checks used the real Express API and MongoDB Atlas database.
- Mobile measurements were `innerWidth: 390` and `documentElement.scrollWidth: 390` on all three routes.
- Temporary acceptance-test users, recipes, and meal plans were removed from MongoDB after the run.
- The earlier mock-service results remain documented separately as historical prototype evidence.
