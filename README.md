# Sidequest

Sidequest makes a little room in your day. It turns a short free-time brief into a low-pressure mini-adventure, then lets a person and their browser agent tune the route together.

This is a WebMCP Challenge project. The demo collection is intentionally synthetic and does not claim real-time availability.

## Why WebMCP matters here

Planning a small outing is easy to describe but fiddly to execute: the route needs to stay inside a time window, budget, energy level, and access requirement while still feeling varied. Sidequest exposes the page's actual stateful planning logic as five structured tools:

- `sidequest.search_stops` finds compatible candidates.
- `sidequest.draft_plan` composes a route from the current constraints.
- `sidequest.swap_stop` preserves the draft while tuning one stop.
- `sidequest.inspect_plan` gives the agent current page state instead of requiring DOM guesses.
- `sidequest.save_plan` requires explicit confirmation before changing saved plans.

The same logic powers the normal UI and the WebMCP callbacks. The result is a human-first interface with a reliable agent handoff, rather than an agent-only chat surface.

## Run locally

```bash
npm install
npm run dev
```

For a production check:

```bash
npm run check
npm run smoke
```

To inspect tools locally, use Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled, or ChatGPT's in-app browser. The app is also usable in preview mode in any modern browser.

## Project shape

- `src/data.js` — synthetic curated stop collection.
- `src/logic.js` — pure search, route selection, and swap logic.
- `src/store.js` — small in-memory state store shared by UI and tools.
- `src/webmcp.js` — current WebMCP registration and tool schemas.
- `src/main.js` and `src/styles.css` — human-first UI and responsive states.
- `docs/spec.md` — product acceptance criteria and validation plan.
- `docs/devpost-form-answers.md` — copy-ready, evidence-bound Devpost fields and human-only placeholders.
- `SCIENCE_APPENDIX.md` — source links, decision model, safety evidence, rubric map, and reproducibility limits.

## License

MIT. See `LICENSE`.
