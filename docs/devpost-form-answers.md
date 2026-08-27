# Sidequest — Devpost form-answer packet

This is a copy-ready draft for the WebMCP Challenge form. It is evidence-bound and still requires a human to review eligibility, accept Devpost agreements, attach the final video, and submit.

## Project title

Sidequest

## One-line description

A small plan worth leaving the house for: a human-first micro-adventure planner that an agent can search, compose, and tune through WebMCP.

## Project description

When people get an unexpected free hour, they often want somewhere to go, not another research project. Sidequest turns the shape of that free time—starting area, duration, energy, budget, and step-free access—into one coherent mini-adventure from a small curated collection.

The normal interface drafts three varied moments that fit. A person can tune one stop while keeping the rest of the route intact, then save when the plan feels like theirs. The collection is synthetic demo data; Sidequest does not claim real-time availability, booking, navigation, or local-listing accuracy.

The differentiator is the handoff. The page exposes its actual state and planning transitions through five structured WebMCP tools: `search_stops`, `draft_plan`, `swap_stop`, `inspect_plan`, and `save_plan`. An agent can inspect the current brief, search compatible candidates, draft a constrained route, and replace one stop without guessing from DOM labels. The human UI and agent callbacks share the same pure planning logic, so the visible plan stays coherent. Saving is the only mutation and requires explicit confirmation.

## What did you build?

A polished static web planner with a stateful human+agent workflow. The product surface is intentionally small: one brief, one route, one tuning interaction, and one confirmation-gated save. The app remains usable in preview mode when WebMCP is unavailable.

## How does WebMCP make it better?

Without structured tools, an agent must infer form semantics, search rendered content, and coordinate several edits while preserving time, budget, energy, access, and variety. WebMCP gives the agent named tools, JSON Schemas, executable callbacks, and access to the same live state transitions as the person. The result is a compact inspect → search → draft → tune → ask → save workflow instead of fragile DOM actuation or an agent-only chat surface.

## What can the agent do?

- Inspect the current brief, draft, and machine-readable constraint receipt with `sidequest.inspect_plan`.
- Search the curated collection with hard filters using `sidequest.search_stops`.
- Draft a route with `sidequest.draft_plan`.
- Tune one stop with `sidequest.swap_stop` while preserving the rest of the route.
- Request a save with `sidequest.save_plan`; the tool refuses until `confirm: true` is supplied after the person agrees.

## What can the person do?

Set the shape of the free-time window, review the route totals, tune a stop, start over, and decide whether the draft should be saved. The person owns intent and the final state-changing action.

## How was it built?

The app is dependency-free JavaScript and CSS. `src/data.js` owns synthetic stops; `src/logic.js` owns pure filtering, combination scoring, aggregate constraints, and swaps; `src/store.js` owns shared in-memory state; `src/webmcp.js` owns tool schemas, runtime input bounds, and callbacks; `src/main.js` and `src/styles.css` own the interface. The static deployment runs on Vercel with a restrictive same-origin security policy.

## Testing and evidence

`npm run check` passes 12 tests with zero failures and the static build gate for 13 required files, five WebMCP tools, accessibility/security guards, and this packet. `npm run smoke` exercises inspect → search → draft → inspect → swap → denied save → confirmed save → reset and returns a three-stop, 85-minute, $8 route from the synthetic collection. The full source links, model, safety policy, limitations, and reproducibility steps are in [`SCIENCE_APPENDIX.md`](../SCIENCE_APPENDIX.md).

## Rubric mapping

- WebMCP Leverage: five stateful tools, JSON Schemas, read-only hints, shared state, and confirmation-gated mutation.
- Execution: modular dependency-free implementation, human UI, loading/empty/error states, tests, smoke receipt, public repository, and MIT license.
- Potential Impact: a clear low-friction workflow for turning bounded free time into a coherent plan.
- Creativity & Ambition: the agent handles constraint-heavy coordination while the person keeps the feeling and final say.

## Links

- Live project: https://sidequest-webmcp.vercel.app
- Public repository: https://github.com/DominiqueAndrew/sidequest-webmcp
- License: MIT (`LICENSE`)
- Evidence annex: [`SCIENCE_APPENDIX.md`](../SCIENCE_APPENDIX.md)
- Demo runbook: [`demo-script.md`](demo-script.md)

## Human-only finalization fields

- Live WebMCP browser acceptance: `TBD — human must verify native tool discovery and the visible workflow in ChatGPT’s in-app browser or Chrome 149+.`
- Public demo video: `TBD — human must record/upload a public video under three minutes with audio.`
- Eligibility and Devpost agreements: `TBD — human must review and accept.`
- Final submission confirmation: `TBD — no Devpost submission has been made or claimed.`

Use the [official Devpost rules](https://webmcp.devpost.com/rules) as the authority for current dates, eligibility, prizes, judging, and submission requirements. The [OpenAI challenge page](https://openai.com/webmcp-challenge/) and [WebMCP draft specification](https://webmachinelearning.github.io/webmcp/) provide supporting context; they do not replace the rules.
