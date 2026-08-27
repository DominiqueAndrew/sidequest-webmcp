# Sidequest — product and verification spec

## Problem and wedge

People with an unexpected free hour often want to leave the house but do not want another research project. Sidequest turns a short free-time brief into one coherent, low-pressure route from a small curated collection.

The wedge is not generic recommendations. The useful job is preserving a person's constraints across a multi-stop plan while leaving the person in charge of the feeling and final save.

## User stories

1. As a person with 90 minutes, I can describe time, energy, budget, and access needs and receive a route that fits.
2. As a person reviewing the route, I can tune one stop without losing the rest of the plan.
3. As an agent assisting the person, I can inspect state, search structured candidates, draft a plan, swap a compatible stop, and save only after confirmation.
4. As a judge, I can see the same workflow through normal UI controls and through five discoverable WebMCP tools.

## Acceptance criteria

- Given a brief with 90 minutes, an $18 budget, gentle energy, and step-free access, when a plan is built, then it has at most 90 minutes, costs at most $18, contains distinct stop types, and every stop is step-free.
- Given a draft route, when the person chooses “Tune this stop” and an alternative, then only that stop changes and the route is resequenced.
- Given the current page in a WebMCP-capable browser, when tools are inspected, then `sidequest.search_stops`, `sidequest.draft_plan`, `sidequest.swap_stop`, `sidequest.inspect_plan`, and `sidequest.save_plan` are registered with JSON Schemas and executable callbacks.
- Given an agent calls `sidequest.save_plan` without `confirm: true`, then no saved plan is created and the page shows a confirmation request.
- Given `sidequest.save_plan` is called with `confirm: true` before page approval for the current plan, then no saved plan is created and the tool returns a confirmation requirement.
- Given a person approves the visible request for the current plan, when the agent calls `sidequest.save_plan` with `confirm: true`, then exactly one saved plan is created.
- Given a browser without WebMCP, when the page loads, then the planner remains fully usable in preview mode and clearly reports that state.
- At 390, 768, 1366, 1440, 1920, and 2560 pixel widths, when the planner is rendered, then there is no horizontal overflow and the brief, route, and primary action remain legible.

## Non-goals

- No accounts, payments, booking, location tracking, or external API dependency.
- No claim that the curated demo stops are real-time availability or factual local listings.
- No autonomous external action: saving is the only persisted action and is explicitly human-confirmable.

## Data and risk notes

The stop collection is synthetic demo data. The app keeps state in memory only; refresh resets the demo. WebMCP is progressive enhancement, so a browser without the API still receives the human-first product.

## Validation plan

1. `npm run test` for route constraints, search filtering, swap behavior, and formatting.
2. `npm run build` for strict TypeScript and production packaging.
3. Browser smoke test for initial plan, loading, tuning, preview handoff, and no horizontal overflow across the required viewport matrix.
4. WebMCP-capable browser or DevTools inspection for tool registration and manual invocation when available.
