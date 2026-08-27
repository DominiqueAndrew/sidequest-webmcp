# Devpost submission draft

## Project title

Sidequest

## One-line description

A small plan worth leaving the house for: a human-first 90-minute micro-adventure planner that an agent can search, compose, and tune through WebMCP.

## Project description

People with an unexpected free hour often want to go somewhere, but not spend that hour researching. Sidequest turns a short free-time brief into one coherent, low-pressure mini-adventure from a curated collection.

The person sets the shape of the window: where they start, how long they have, their energy level, budget, and whether the route must be step-free. Sidequest drafts three distinct moments that fit. The person can tune any one stop while keeping the rest of the route intact, then save the plan when it feels like theirs.

WebMCP is what makes the agent handoff materially better. The page exposes its real state and planning logic as five structured tools: `search_stops`, `draft_plan`, `swap_stop`, `inspect_plan`, and `save_plan`. An agent can inspect the current brief, search compatible candidates, compose a valid route, and replace one stop without guessing from DOM labels or losing constraints. The normal interface and the agent callbacks use the same pure planning functions, so the plan stays visible and coherent throughout.

Saving is deliberately human-controlled. `save_plan` first creates a visible request bound to the current plan; the person approves that request in the page, and only then can the agent's `confirm: true` call commit it. The app has no account, payment, location tracking, booking, or external API dependency. Its collection is synthetic demo data and is labelled as such.

The judge-facing moment is a shared state machine, not a chat surface: inspect the live brief, search the constrained collection, draft a route, tune exactly one stop, ask before saving, then let the person decide. Each step produces a structured result and a visible activity entry. This is the smallest workflow that shows why WebMCP matters: the agent coordinates the fiddly state transitions, while the human keeps the intent and the final write.

## What was difficult or impossible before

Without structured tools, an agent would have to infer the meaning of a multi-field brief from a visual form, search a rendered list, and coordinate several edits while hoping it preserved time, budget, energy, and access requirements. With WebMCP, it can operate on the same typed state transitions as the human UI and return compact, structured results after each step.

## Evidence snapshot

The zero-dependency `npm run smoke` receipt exercises `inspect_plan → search_stops → draft_plan → inspect_plan → swap_stop → save_plan(false) → human_approve_save → save_plan(true) → reset`. On the checked revision it returned two constrained coffee candidates, a three-stop route of 85 minutes and $8, preserved the two untouched stops during the swap, denied both the initial and premature save attempts with zero saved plans, accepted the confirmed call only after page-owned approval, and reset to a blank state. `npm run check` passes 14 tests and the static build gate for 14 required files, five WebMCP tools, and accessibility/security guards.

These are deterministic local/runtime results, not a user study or live-agent browser benchmark. Native WebMCP acceptance and the public video remain explicit release gates; a cache-busted Chrome visual smoke confirms the deployed UI renders, the local handoff interaction updates state, and the six-width responsive matrix has been captured and inspected without horizontal overflow. The research and claim boundary are documented in [`SCIENCE_APPENDIX.md`](../SCIENCE_APPENDIX.md).

## How to test

1. Open the live app: https://sidequest-webmcp.vercel.app
2. Use ChatGPT's in-app browser, or Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled.
3. Ask the agent: “I have 90 minutes near Riverside, want a gentle step-free plan under $18. Use Sidequest to inspect the current plan, search for a quiet stop, and draft the best route.”
4. Ask: “Swap the first stop for the other compatible coffee option, then show me the revised plan.”
5. Ask: “Save this as A good little Saturday.” The agent should create a visible approval request because saving is a state-changing action. Approve it in the page, then let the agent confirm the final save.

The project is designed to remain usable in a browser without WebMCP, where it reports “WebMCP preview.” This fallback is covered by the source path and static checks; Chrome visual smoke and the six-width responsive matrix are verified, while native tool discovery remains an open gate.

The evidence boundary, research sources, decision model, safety controls, rubric map, and the remaining native-WebMCP browser limitation are documented in [`SCIENCE_APPENDIX.md`](../SCIENCE_APPENDIX.md).

Copy-ready form answers, rubric language, exact links, and the remaining human-only fields are in [`devpost-form-answers.md`](devpost-form-answers.md).

## Repository and license

- Repository: https://github.com/DominiqueAndrew/sidequest-webmcp
- License: MIT
- Evidence-packet checklist commit: `226afbd78f62a74800775f8751d02088f3a05a45` (documentation-only human-gate checklist; pushed to `main`).
- Application/runtime revision: `68e8e2160d922b83cdff72bb836825b66e7dcb15` (page-owned save approval; deployed below).
- Smoke harness introduced in: `452c2c178b0d9cc3d75a9c5536c0f3b2178e5ccd` (covered by the application revision above)
- Last verified production deployment: `dpl_Aod89VWnNWwmKN3QH9idVFjCWP7j` (READY)
- Stable deployment alias: https://sidequest-webmcp.vercel.app

## Demo video

To add before submission: a public YouTube recording under three minutes, with spoken audio, showing the live app and the WebMCP tool-assisted workflow. Use the script in `docs/demo-script.md`. Do not add copyrighted music or third-party marks.

Use [`human-gate-checklist.md`](human-gate-checklist.md) for the exact browser, video, eligibility, and final-submission handoff.
