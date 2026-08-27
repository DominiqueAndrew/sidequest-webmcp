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

## What was difficult or impossible before

Without structured tools, an agent would have to infer the meaning of a multi-field brief from a visual form, search a rendered list, and coordinate several edits while hoping it preserved time, budget, energy, and access requirements. With WebMCP, it can operate on the same typed state transitions as the human UI and return compact, structured results after each step.

## How to test

1. Open the live app: https://sidequest-webmcp.vercel.app
2. Use ChatGPT's in-app browser, or Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled.
3. Ask the agent: “I have 90 minutes near Riverside, want a gentle step-free plan under $18. Use Sidequest to inspect the current plan, search for a quiet stop, and draft the best route.”
4. Ask: “Swap the first stop for the other compatible coffee option, then show me the revised plan.”
5. Ask: “Save this as A good little Saturday.” The agent should ask for confirmation because saving is a state-changing action. Confirm only if you want to test the final save.

The project is also fully usable in a browser without WebMCP, where it clearly reports “WebMCP preview.”

The evidence boundary, research sources, decision model, safety controls, rubric map, and unreconciled browser-validation limitation are documented in [`SCIENCE_APPENDIX.md`](../SCIENCE_APPENDIX.md).

## Repository and license

- Repository: https://github.com/DominiqueAndrew/sidequest-webmcp
- License: MIT
- Deployed commit: update after the next production deployment.

## Demo video

To add before submission: a public YouTube recording under three minutes, with spoken audio, showing the live app and the WebMCP tool-assisted workflow. Use the script in `docs/demo-script.md`. Do not add copyrighted music or third-party marks.
