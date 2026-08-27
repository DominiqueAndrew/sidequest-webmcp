# Sidequest — science, engineering, and submission appendix

This annex records the evidence behind Sidequest’s material product and safety claims. It is intentionally separate from the short [README](README.md) and [Devpost draft](docs/devpost-submission.md).

## Evidence boundary

This review was performed on 2026-08-27. The Devpost Hackathons connector available to the supervisor thread was not exposed in this worktree; it was not installed or probed. Event facts below therefore come from the official Devpost rules and OpenAI challenge page. Devpost states that individuals may enter, registration/submission closes on 2026-09-03 at 1:00 p.m. PDT (2026-09-03T20:00:00Z), and each of the top ten submissions receives $3,000 cash plus sponsor benefits. The rules also require a working live URL testable in ChatGPT’s in-app browser or Chrome with WebMCP enabled, a public code repository with an open-source license, and a public demo video under three minutes with audio. Rules can change; the official rules govern.

Sources:

| Source | What it establishes |
| --- | --- |
| [Official Devpost rules](https://webmcp.devpost.com/rules) | Eligibility, dates, live-URL/repository/video requirements, judge criteria, and prize package. |
| [OpenAI WebMCP Challenge](https://openai.com/webmcp-challenge/) | Challenge framing, WebMCP value proposition, access paths, deadline, and prize summary. |
| [WebMCP draft specification](https://webmachinelearning.github.io/webmcp/) | Current `document.modelContext.registerTool` shape, schemas, executable tools, hints, and status as a draft Community Group Report rather than a W3C Standard. |
| [Chrome WebMCP overview](https://developer.chrome.com/docs/ai/webmcp) | Structured discovery, JSON Schema, shared page state, reliability rationale, browser enablement, and user interaction for sensitive actions. |
| [Chrome DevTools WebMCP inspection](https://developer.chrome.com/docs/devtools/application/webmcp) | Practical inspection and manual invocation of registered tools, schemas, and results. |
| [Chrome agent security guidance](https://developer.chrome.com/docs/agents/security) | Indirect-injection risk, deterministic guardrails, read-only hints, output limits, origin restrictions, and human control for state changes. |
| [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/) | Focus, labels, target-size, contrast, and resize-text criteria used for the UI review. |
| [NIST AI RMF 1.0](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10) | Voluntary risk-management framing for transparency, accountability, and human oversight. |
| [Iyengar & Lepper (2000), PubMed](https://pubmed.ncbi.nlm.nih.gov/11138768/?dopt=Abstract) | Primary evidence that choice-set size can affect engagement and satisfaction in some decision contexts. |
| [Chernev, Böckenholt & Goodman (2015)](https://myscp.onlinelibrary.wiley.com/doi/full/10.1016/j.jcps.2014.08.002) | Meta-analysis showing that choice overload is contextual, moderated by task difficulty, preference uncertainty, and decision goals. |

## Claim-to-evidence map

| Material claim | Classification | Evidence and current status |
| --- | --- | --- |
| WebMCP gives an agent structured discovery, schemas, executable state transitions, and current state instead of DOM guessing. | Engineering claim | Supported by the WebMCP draft and Chrome overview; implemented in `src/webmcp.js` with five tools and shared `src/store.js` state. Live browser inspection remains pending. |
| A small, varied route is a defensible wedge for a short free-time decision. | Research-backed hypothesis | Choice research supports testing constrained sets in context, not a universal “fewer is always better” rule. Sidequest currently offers three moments and a small curated collection; no user study has been run. |
| A generated route respects hard time, budget, energy, access, and variety constraints when a full three-stop combination exists. | Calculated/property-tested claim | `canFit`, combination selection, aggregate fallback, and swap guards in `src/logic.js`; covered by the automated tests listed below. Synthetic stops have no real-world availability guarantee. |
| An agent can prepare and tune a plan while a person controls saving. | Engineering/safety claim | Read-only annotations mark search/inspect; `save_plan` requires `confirm === true`, and the UI exposes the same state. Covered by `tests/webmcp.test.mjs`; no external action exists. |
| The page has basic responsive and keyboard-accessible affordances. | Implementation claim, not conformance claim | Semantic labels, skip link, visible focus styles, live regions, reduced-motion handling, and responsive CSS are present. Static checks pass; required multi-viewport browser screenshots were blocked by missing local browser binaries. |

## Decision model

For each stop `s`, let:

- `d_s` be duration in minutes;
- `c_s` be price in demo currency;
- `e_s ∈ {0,1,2}` be energy rank for gentle, balanced, bright;
- `a_s ∈ {0,1}` indicate step-free access;
- the brief be `(T, B, E, A)`, where `T` is available time, `B` is total budget, `E` is maximum energy rank, and `A` is whether step-free access is required.

An individual stop is eligible when:

`d_s ≤ T ∧ c_s ≤ B ∧ e_s ≤ E ∧ (A ⇒ a_s = 1)`.

A route `P` is aggregate-valid when:

`Σ(P)d_s ≤ T ∧ Σ(P)c_s ≤ B`.

The primary three-stop selector additionally requires three distinct categories. If no such combination exists, the fallback greedily returns the largest prefix of eligible candidates that still satisfies the aggregate bounds; it does not claim three-category variety in that case. A swap is accepted only when the replacement is eligible, not already present, aggregate bounds still hold, and the number of distinct categories does not decrease.

The current deterministic ranking function is:

`score(P) = 14·|categories(P)| + max(0, 40 − |T − Σd_s|) + max(0, 18 − |B − Σc_s|) + 12·I(E = gentle ∧ every e_s = gentle)`.

The constants are product heuristics, not learned parameters and not validated effect sizes. They reward variety, use of the available window, budget fit, and a gentle route for a gentle brief. The model has no travel-time, opening-hours, or live inventory term, so the output is a synthetic planning demonstration rather than a real booking or navigation decision.

Saving uses a fail-closed rule: `save_allowed = (plan exists) ∧ (confirm === true)`. The policy treats an accidental save as a higher-cost error than one extra confirmation request. No probability or user-harm estimate is claimed; the threshold is a deliberate product safety rule.

## Reproducible evaluation

### Automated results

On the checked worktree, the following passed:

```text
npm run check
10 tests passed, 0 failed
build check passed: 10 required files and 5 WebMCP tools
node --check src/logic.js
```

The tests cover a varied route, hard-constraint search, resequencing, formatting, fewer-than-three fallback behavior, aggregate fallback bounds, swap rejection, tool names/schemas/callbacks, shared-state drafting, confirmation-gated saving, and a genuinely blank reset state.

### Tool-level metrics

For a future live-agent evaluation, define `tool_success_rate = completed_calls / attempted_calls`, `invalid_input_rate = invalid_calls / attempted_calls`, `constraint_violation_rate = violating_plans / drafted_plans`, `calls_to_valid_plan`, `human_confirmation_rate`, and `unauthorized_save_count`. The safety target for `unauthorized_save_count` is exactly zero. This repository has deterministic contract tests, but no live-agent sample large enough to report those rates.

### Human workflow experiment

The next meaningful product experiment should compare the current constrained three-stop flow with a deliberately larger candidate-list control. Pre-register the brief distribution, candidate-set size, and stopping rule. Primary measures: completion rate, time to first valid plan, abandonment, number of swaps, and save-confirmation rate. Analyze by task difficulty and preference certainty because the meta-analysis indicates those moderators matter. Do not infer a causal benefit from this prototype until the experiment is run; the current result is a hypothesis, not a measured outcome.

### Browser acceptance matrix

Run the following from a clean checkout:

```bash
npm install
npm run check
npm run smoke
npm run dev
```

Open `http://localhost:4173` in ChatGPT’s in-app browser, or in Chrome 149+ after enabling `chrome://flags/#enable-webmcp-testing`. Inspect the page in Chrome DevTools’ WebMCP panel. Verify the five tools, then exercise: inspect → search → draft → swap → save without confirmation → explicit confirmation → reset. Capture screenshots at widths 390, 768, 1366, 1440, 1920, and 2560 pixels and check that `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.

This worktree could not complete that matrix because the local Playwright browser cache and Chrome/Chromium executables were unavailable, and network installation was intentionally not used. A bounded in-app-browser attempt on 2026-08-27 did connect and load the live HTML shell with HTTP 200 and `readyState=complete`, but `#app` remained empty, the captured screenshot was blank, and native tool inspection returned `gpt-5.6-luna does not support command "webmcp_list_tools"`. Therefore no browser screenshot, live WebMCP invocation, or visual product result is claimed here; this is an environment/capability blocker, not evidence that the source contract is invalid.

The zero-dependency runtime smoke harness in `scripts/smoke.mjs` exercises the real tool callbacks and prints a stable JSON receipt. It is the reproducible non-browser evidence boundary for the complete inspect → search → draft → inspect → swap → denied save → confirmed save → reset workflow; it does not replace live browser validation.

## Architecture and safety evidence

The product is split into synthetic data (`src/data.js`), pure planning logic (`src/logic.js`), in-memory shared state (`src/store.js`), WebMCP contracts (`src/webmcp.js`), and presentation (`src/main.js`, `src/styles.css`). The UI and agent callbacks call the same planning functions, which prevents a separate “agent path” from silently weakening constraints. Tool schemas declare bounds and callbacks normalize strings and finite numeric values at runtime; `tests/webmcp.test.mjs` covers malformed-input behavior.

The demo has no accounts, secrets, payments, location tracking, booking, external API calls, or persistent user data. Dynamic text inserted into the HTML shell is escaped. The static deployment sets a same-origin Content Security Policy, `frame-ancestors 'none'`, strict referrer policy, `nosniff`, and a restrictive Permissions Policy. `save_plan` is the only state-changing tool and is confirmation-gated. Current data is curated and local, so it is not marked as external untrusted content; if external listings are added later, outputs must be bounded and treated as untrusted per Chrome’s security guidance.

These controls reduce obvious attack and surprise surfaces but are not a security certification. In particular, the WebMCP draft is experimental, the UI has not received an assistive-technology audit, and no adversarial tool-description or indirect-injection evaluation has been run.

## Official rubric and submission annex

The official rules describe four equally weighted Stage Two criteria:

| Criterion | Sidequest evidence | Remaining gap |
| --- | --- | --- |
| WebMCP Leverage | Five stateful tools, JSON Schemas, read-only annotations, shared UI/tool state, and a consent-gated mutation. | Live judge-browser tool inspection and a recorded invocation. |
| Execution | Small modular static app, loading/empty/error states, tuning flow, tests, license, and reproducible local run. | Browser screenshots and independent live smoke test. |
| Potential Impact | A clear low-friction job: turn a bounded free-time window into a coherent plan without research overhead. | User research and evidence beyond the prototype. |
| Creativity & Ambition | The product preserves the person’s “feeling” while delegating constraint-heavy coordination, instead of presenting an agent chat as the product. | Stronger differentiation will come from a live demo showing the handoff’s speed and reliability. |

Submission checklist, based on the official rules:

- [x] Working implementation and live URL: [Sidequest](https://sidequest-webmcp.vercel.app) (deployment status must be rechecked after each release).
- [x] Public source repository: [DominiqueAndrew/sidequest-webmcp](https://github.com/DominiqueAndrew/sidequest-webmcp).
- [x] Open-source license: MIT in `LICENSE`.
- [x] English project description and testing instructions in `docs/devpost-submission.md`.
- [ ] Public YouTube demo under three minutes with audio.
- [ ] Final human review of Devpost agreements and submission confirmation.

No Devpost submission is claimed. The remaining gates require a human-controlled recording/upload and final submission confirmation.

## Reproducibility and limitations

The exact source revision, deployment URL, and validation receipts belong in the final release status and in `docs/devpost-submission.md`. Re-run `npm run check`, inspect `git rev-parse HEAD`, fetch the public URL, and verify the Vercel deployment is READY before treating a release as current.

Known limitations are material: synthetic stops are not factual local listings; the planner omits travel time and hours; ranking weights are heuristic; no live-agent reliability sample or user study exists; browser validation is currently environment-blocked; and the WebMCP API/specification may change before the challenge deadline. These limitations are part of the claim boundary, not hidden product behavior.
