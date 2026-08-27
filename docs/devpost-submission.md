# Devpost submission draft

## Project title

Sidequest

## One-line description

A small plan worth leaving the house for: a human-first 90-minute micro-adventure planner that an agent can search, compose, and tune through WebMCP.

## Project description

People with an unexpected free hour often want to go somewhere, but not spend that hour researching. Sidequest turns a short free-time brief into one coherent, low-pressure mini-adventure from a curated collection.

The person sets the shape of the window: where they start, how long they have, their energy level, budget, and whether the route must be step-free. Sidequest drafts three distinct moments that fit. The person can tune any one stop while keeping the rest of the route intact, then save the plan when it feels like theirs.

WebMCP is what makes the agent handoff materially better. The page exposes its real state and planning logic as five structured tools: `search_stops`, `draft_plan`, `swap_stop`, `inspect_plan`, and `save_plan`. An agent can inspect the current brief, search compatible candidates, compose a valid route, and replace one stop without guessing from DOM labels or losing constraints. The normal interface and the agent callbacks use the same pure planning functions, so the plan stays visible and coherent throughout.

Saving is deliberately human-controlled. `save_plan` returns a confirmation request unless the agent calls it with `confirm: true` after the person has explicitly agreed. The app has no account, payment, location tracking, booking, or external API dependency. Its collection is synthetic demo data and is labelled as such.

The judge-facing moment is a shared state machine, not a chat surface: inspect the live brief, search the constrained collection, draft a route, tune exactly one stop, ask before saving, then let the person decide. Each step produces a structured result and a visible activity entry. This is the smallest workflow that shows why WebMCP matters: the agent coordinates the fiddly state transitions, while the human keeps the intent and the final write.

## What was difficult or impossible before

Without structured tools, an agent would have to infer the meaning of a multi-field brief from a visual form, search a rendered list, and coordinate several edits while hoping it preserved time, budget, energy, and access requirements. With WebMCP, it can operate on the same typed state transitions as the human UI and return compact, structured results after each step.

## Evidence snapshot

The zero-dependency `npm run smoke` receipt exercises `inspect_plan → search_stops → draft_plan → inspect_plan → swap_stop → save_plan(false) → save_plan(true) → reset`. On the checked revision it returned two constrained coffee candidates, a three-stop route of 85 minutes and $8, preserved the two untouched stops during the swap, denied the first save with zero saved plans, accepted the explicit confirmation, and reset to a blank state. `npm run check` passes 11 tests and the static build gate for 12 required files, five WebMCP tools, and accessibility/security guards.

These are deterministic local/runtime results, not a user study or live-agent browser benchmark. Browser validation, screenshots, and the public video remain explicit release gates; the research and claim boundary are documented in [`SCIENCE_APPENDIX.md`](../SCIENCE_APPENDIX.md).

## How to test

1. Open the live app: https://sidequest-webmcp.vercel.app
2. Use ChatGPT's in-app browser, or Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled.
3. Ask the agent: “I have 90 minutes near Riverside, want a gentle step-free plan under $18. Use Sidequest to inspect the current plan, search for a quiet stop, and draft the best route.”
4. Ask: “Swap the first stop for the other compatible coffee option, then show me the revised plan.”
5. Ask: “Save this as A good little Saturday.” The agent should ask for confirmation because saving is a state-changing action. Confirm only if you want to test the final save.

The project is designed to remain usable in a browser without WebMCP, where it reports “WebMCP preview.” This fallback is covered by the source path and static checks; live visual/browser acceptance is still an open gate in this worktree.

The evidence boundary, research sources, decision model, safety controls, rubric map, and unreconciled browser-validation limitation are documented in [`SCIENCE_APPENDIX.md`](../SCIENCE_APPENDIX.md).

Copy-ready form answers, rubric language, exact links, and the remaining human-only fields are in [`devpost-form-answers.md`](devpost-form-answers.md).

## Repository and license

- Repository: https://github.com/DominiqueAndrew/sidequest-webmcp
- License: MIT
- Application/runtime revision: `39c02a97cbde8726ab5f3fece88e3dfe38a5663f`
- Smoke-harness/repository revision: `452c2c178b0d9cc3d75a9c5536c0f3b2178e5ccd`
- Stable deployment alias: https://sidequest-webmcp.vercel.app

## Demo video

To add before submission: a public YouTube recording under three minutes, with spoken audio, showing the live app and the WebMCP tool-assisted workflow. Use the script in `docs/demo-script.md`. Do not add copyrighted music or third-party marks.
