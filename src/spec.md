# Specification

## Summary
**Goal:** Fix the authentication flow so users can access the main application after signing in with Internet Identity.

**Planned changes:**
- Redirect authenticated users from the landing page to the main application interface
- Ensure ProfileSetupModal appears for new users and blocks access until profile setup is complete
- Verify Layout component and main routes render correctly after authentication state changes
- Fix navigation so users can access Projects, Shopping Lists, Tasks, and other main features after sign-in

**User-visible outcome:** After signing in with Internet Identity, users will be able to access and navigate the main application features instead of being stuck on the landing page. New users will complete profile setup before accessing the app, while returning users go directly to the main interface.
