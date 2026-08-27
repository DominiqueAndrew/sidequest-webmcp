# Sidequest — science, engineering, and submission appendix

This annex records the evidence behind Sidequest’s material product and safety claims. It is intentionally separate from the short [README](README.md) and [Devpost draft](docs/devpost-submission.md).

## Evidence boundary

This review was performed on 2026-08-27. The Devpost Hackathons connector available to the supervisor thread was not exposed in this worktree; it was not installed or probed. Event facts below therefore come from the official Devpost rules and OpenAI challenge page. Devpost states that eligible individuals may enter if they are at least the age of majority where they reside and meet the supported-country and conflict restrictions; registration/submission closes on 2026-09-03 at 1:00 p.m. PDT (2026-09-03T20:00:00Z), judging runs Sep 4–21, and each of the top ten submissions receives $3,000 cash plus sponsor benefits. The rules also require a working live URL testable in ChatGPT’s in-app browser or Chrome with WebMCP enabled, a public code repository with an open-source license, and a public demo video under three minutes with audio. A pre-existing project must be meaningfully extended with WebMCP during the submission period and document the prior/new work boundary. They say the optional Devpost plugin is not the official source of information, require English materials or translations, and require the project to remain free and available for judging/testing through the judging period. Rules can change; the official rules govern.

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

### Submission-period provenance

The public repository history begins with `6208e5384f736801bd4d376fc8c3fd255beb642e` (`chore: initialize hackathon workspace`) at `2026-08-27T15:26:43+02:00`, followed by the initial Sidequest implementation in `3a30039cd982ecbd9cc660b244b8d06599b47f4d` at `2026-08-27T15:39:19+02:00`. Both timestamps fall after the official Submission Period opened on August 25, 2026 at 11:00 a.m. Pacific Time. This is repository-history evidence that this submitted repository was created during the Submission Period; if any material existed outside this history, the entrant must disclose that boundary honestly in the Devpost submission.

## Claim-to-evidence map

| Material claim | Classification | Evidence and current status |
| --- | --- | --- |
| WebMCP gives an agent structured discovery, schemas, executable state transitions, and current state instead of DOM guessing. | Engineering claim | Supported by the WebMCP draft and Chrome overview; implemented in `src/webmcp.js` with five tools and shared `src/store.js` state. Chrome visual smoke, six-width responsive inspection, and page-local handoff interaction pass; native live tool inspection remains pending. |
| A small, varied route is a defensible wedge for a short free-time decision. | Research-backed hypothesis | Choice research supports testing constrained sets in context, not a universal “fewer is always better” rule. Sidequest currently offers three moments and a small curated collection; no user study has been run. |
| A generated route respects hard time, budget, energy, access, and variety constraints when a full three-stop combination exists. | Calculated/property-tested claim | `canFit`, combination selection, aggregate fallback, and swap guards in `src/logic.js`; covered by the automated tests listed below. Synthetic stops have no real-world availability guarantee. |
| An agent can prepare and tune a plan while a person controls saving. | Engineering/safety claim | Read-only annotations mark search/inspect; `save_plan` requires `confirm === true`, and the UI exposes the same state. Covered by `tests/webmcp.test.mjs`; no external action exists. |
| The page has basic responsive and keyboard-accessible affordances. | Implementation claim, not conformance claim | Semantic labels, skip link, visible focus styles, live regions, reduced-motion handling, and responsive CSS are present. `npm run build` now fails if the semantic landmarks, focus/reduced-motion selectors, or 1080/800/480px breakpoint guards disappear; the required six-width Chrome matrix and a mobile keyboard-focus pass were captured and inspected. |

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
13 tests passed, 0 failed
build check passed: 13 required files, 5 WebMCP tools, and accessibility/security guards
node --check src/logic.js
```

The tests cover a varied route, hard-constraint search, resequencing, formatting, fewer-than-three fallback behavior, aggregate fallback bounds, swap rejection, tool names/schemas/callbacks, native registration payload/order, shared-state drafting, confirmation-gated saving, and a genuinely blank reset state. The native-registration test supplies a local `document.modelContext.registerTool` stub and restores it after the assertion; it verifies the page-owned contract but cannot prove a browser host discovers or invokes the tools.

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

The local Playwright path could not run because its browser cache and Chrome/Chromium executables were unavailable, and network installation was intentionally not used. A separate controlled Chrome session completed the six-width matrix documented below. A bounded in-app-browser attempt on 2026-08-27 did connect and load the live HTML shell with HTTP 200 and `readyState=complete`, but `#app` remained empty, the captured screenshot was blank, and native tool inspection returned `gpt-5.6-luna does not support command "webmcp_list_tools"`. A single controlled reload with a read-only DevTools cursor captured zero runtime exceptions, console events, network failures, or response events, so that blank state could not be localized to a reproducible page exception. The separate Chrome result and the resolved source causes are recorded below; in-app native WebMCP invocation is still not claimed.
As a separate non-browser compatibility check, the deployed alias returned HTTP 200 with expected content types for `index.html`, `src/main.js`, `src/styles.css`, `src/data.js`, `src/logic.js`, `src/store.js`, and `src/webmcp.js`; the CSP was present. This rules out a missing public module or stylesheet artifact in the checked deployment.

A separate Chrome extension attempt on 2026-08-27 reached the stable URL and correct page title, but the pre-fix document was `readyState=complete` with `body.innerHTML.length=85`, `#app.innerHTML.length=0`, and no stylesheet entries; the screenshot was blank. Chrome exposed only `pageAssets` and `cdp` tab capabilities, with no native WebMCP discovery surface. A read-only CDP cursor returned zero buffered runtime exceptions, console events, network failures, or response events at inspection time. This was the initial browser symptom, not the final source state.

### Blank-page incident and resolution

The first blank page had two sequential module-graph causes. The static entrypoint imported `./styles.css` from `src/main.js`, which is invalid when the project is served as unbundled browser modules; the browser must receive CSS through an HTML stylesheet link. After that was corrected, Chrome exposed a second error: `main.js` imported `searchStops` from `data.js`, although `searchStops` is exported by `logic.js`. The final fix links `/src/styles.css` in `index.html`, removes the CSS import, wires the named exports to their owning modules, and adds static build guards for both invariants. A cache-busted runtime URL (`/src/main.js?v=7e616fc`) ensures the browser does not reuse the pre-fix module URL.

After deployment `dpl_G5acXESgUg4W2uw7U8ZvnN5GKiSr`, Chrome loaded the cache-busted entrypoint with the stylesheet, produced a non-empty `#app` (`10,712` HTML characters), rendered the route and handoff panels, and had no new page error during the repaired load. Clicking “Preview an agent handoff” updated the visible activity rail with inspect/search/draft events. This verifies the visual/runtime path; it does not verify native WebMCP discovery.

### Responsive Chrome receipt

At the required CSS viewport sizes, the post-fix Chrome session captured and visually inspected viewport screenshots. Every size rendered a non-empty app, kept `document.documentElement.scrollWidth === document.documentElement.clientWidth`, and preserved the route/agent composition without clipped controls:

| Viewport | Verdict | Observed state |
| --- | --- | --- |
| 390×844 mobile | Pass | Single-column brief; CTA remains visible; route continues below the fold intentionally. |
| 768×1024 tablet | Pass | Two-column brief fields with a full-width CTA; plan begins cleanly below. |
| 1366×768 laptop | Pass | Sidebar, route, and handoff panel align; long route continues below the fold. |
| 1440×900 desktop | Pass | Same composition with comfortable spacing and no clipping. |
| 1920×1080 large desktop | Pass | Centered max-width content remains balanced; no overflow. |
| 2560×1440 wide desktop | Pass | Wide composition remains centered and intact; no overflow. |

At 390×844, seven Tab presses reached the skip link, four labeled selects, the step-free checkbox, and the build CTA; each reported a visible `3px solid` focus outline. The post-fix interaction emitted no new error-level logs; the Chrome session retained two historical pre-fix named-export errors from the earlier cached module URL, which are not evidence of the repaired load. Screenshots were inspected in-session rather than persisted as repository files; the numeric receipt and source/deployment revision are the reproducible record.

The zero-dependency runtime smoke harness in `scripts/smoke.mjs` exercises the real tool callbacks and prints a stable JSON receipt. It is the reproducible non-browser evidence boundary for the complete inspect → search → draft → inspect → swap → denied save → confirmed save → reset workflow; it does not replace live browser validation.

## Architecture and safety evidence

The product is split into synthetic data (`src/data.js`), pure planning logic (`src/logic.js`), in-memory shared state (`src/store.js`), WebMCP contracts (`src/webmcp.js`), and presentation (`src/main.js`, `src/styles.css`). The UI and agent callbacks call the same planning functions, which prevents a separate “agent path” from silently weakening constraints. Tool schemas declare bounds and callbacks normalize strings and finite numeric values at runtime; `tests/webmcp.test.mjs` covers malformed-input behavior. `inspect_plan` also returns a machine-readable receipt for time, budget, energy, access, and category variety, making the agent’s next decision auditable. The human build action is both disabled and handler-guarded while a route is in flight, preventing duplicate asynchronous builds; the static build gate checks this contract.

The demo has no accounts, secrets, payments, location tracking, booking, external API calls, or persistent user data. Dynamic text inserted into the HTML shell is escaped. The static deployment sets a same-origin Content Security Policy, `frame-ancestors 'none'`, strict referrer policy, `nosniff`, and a restrictive Permissions Policy. `save_plan` is the only state-changing tool and is confirmation-gated. Current data is curated and local, so it is not marked as external untrusted content; if external listings are added later, outputs must be bounded and treated as untrusted per Chrome’s security guidance.

These controls reduce obvious attack and surprise surfaces but are not a security certification. In particular, the WebMCP draft is experimental, the UI has not received an assistive-technology audit, and no adversarial tool-description or indirect-injection evaluation has been run.

### Focused boundary review

This is a source review of the static application, not a penetration test. The realistic attacker is an agent or caller supplying malformed tool arguments; they do not gain server, account, filesystem, or third-party API privileges because none are exposed by this demo. The relevant scenarios and controls are:

| Scenario (hypothesis, not a confirmed finding) | Invariant and possible impact | Effective control and evidence | Residual uncertainty |
| --- | --- | --- | --- |
| A caller sends oversized strings or non-finite/out-of-range numbers to search, draft, swap, or save. | Tool execution remains bounded and cannot alter the curated collection or create an unbounded response. | JSON Schema bounds in `src/webmcp.js:61-70`, `91-100`, `115-121`, and `151-157`; runtime normalization in `src/webmcp.js:16-38`, `74-82`, `103-108`, `124-130`, and `159-166`; malformed-input regression coverage in `tests/webmcp.test.mjs:58-80`. | No load or concurrency benchmark was run; this is a small in-memory collection. |
| A caller tries to make a state-changing save look read-only or bypass consent with a truthy string. | Only an explicit human-confirmed mutation may add a saved plan. | Read-only annotations are limited to search/inspect in `src/webmcp.js:72` and `140`; save requires `values.confirm !== true` to reject in `src/webmcp.js:159-166`; the test asserts both annotation scope and rejection of `confirm: 'true'` in `tests/webmcp.test.mjs:18-24` and `33-43`. | The browser host's own confirmation UX was not available in this worktree; native live invocation remains open. |
| A caller-controlled name, activity detail, or curated text reaches the HTML shell and becomes markup. | Text remains text; the agent cannot inject script or event attributes into the visible UI. | Dynamic text is escaped by `escapeHtml` in `src/main.js:12` and applied to plan, stop, activity, and error text in `src/main.js:19-25`; CSP in `vercel.json:5-13` disallows inline script and cross-origin connections. | No browser-level CSP report or adversarial DOM execution test was run; the UI source is statically inspected and the deployment headers were checked. |
| A tool description or future external listing contains indirect instructions. | Demo content must not acquire authority to invoke unrelated actions or bypass product constraints. | The app has no external listing fetch, account, booking, payment, or arbitrary tool execution; tool callbacks route through the curated store/logic boundary in `src/webmcp.js:55-169`. Future external content must be bounded and treated as untrusted. | No adversarial prompt-injection corpus or live-agent reliability sample has been run. |

No scenario above is reported as a confirmed vulnerability. The review was not independent, did not execute a full scanner, and did not test browser-host isolation, account/tenant boundaries, production persistence, or external integrations because those surfaces do not exist in this prototype.

## Official rubric and submission annex

The official rules describe four equally weighted Stage Two criteria:

| Criterion | Sidequest evidence | Remaining gap |
| --- | --- | --- |
| WebMCP Leverage | Five stateful tools, JSON Schemas, read-only annotations, shared UI/tool state, and a consent-gated mutation. | Live judge-browser tool inspection and a recorded invocation. |
| Execution | Small modular static app, loading/empty/error states, tuning flow, tests, license, and reproducible local run. | Browser screenshots and independent live smoke test. |
| Potential Impact | A clear low-friction job: turn a bounded free-time window into a coherent plan without research overhead. | User research and evidence beyond the prototype. |
| Creativity & Ambition | The product preserves the person’s “feeling” while delegating constraint-heavy coordination, instead of presenting an agent chat as the product. | Stronger differentiation will come from a live demo showing the handoff’s speed and reliability. |

Submission checklist, based on the official rules:

- [x] Public live URL reachable over HTTPS: [Sidequest](https://sidequest-webmcp.vercel.app) (HTTP 200 and deployment status verified).
- [ ] Live WebMCP browser acceptance: native tool discovery still requires ChatGPT in-app browser or Chrome 149+ validation; Chrome visual smoke and the six-width responsive matrix are verified.
- [x] Public source repository: [DominiqueAndrew/sidequest-webmcp](https://github.com/DominiqueAndrew/sidequest-webmcp).
- [x] Open-source license: MIT in `LICENSE`.
- [x] English project description and testing instructions in `docs/devpost-submission.md`.
- [ ] Public YouTube demo under three minutes with audio.
- [ ] Final human review of eligibility (age majority, supported country, and conflicts), project provenance if applicable, Devpost agreements, and submission confirmation.

No Devpost submission is claimed. The remaining gates require a human-controlled recording/upload and final submission confirmation.

## Release receipt

Checked on 2026-08-27:

- Public repository: [DominiqueAndrew/sidequest-webmcp](https://github.com/DominiqueAndrew/sidequest-webmcp), MIT license.
- Application/runtime revision: `3cd700b1bfc69f9869d0cffb135cca777202dda7`.
- Production deployment: `dpl_G5acXESgUg4W2uw7U8ZvnN5GKiSr`, reported READY by Vercel; stable alias: [sidequest-webmcp.vercel.app](https://sidequest-webmcp.vercel.app).
- Local evidence: `npm run check` = 13 passing tests plus the 13-file build gate; `npm run smoke` = complete inspect/search/draft/inspect/swap/denied-save/confirmed-save/reset receipt; `git diff --check` clean.
- Public compatibility evidence: the stable alias returned HTTP 200, the expected HTML/runtime markers, and the restrictive CSP. This is a static/deployment check, not live WebMCP browser acceptance.
- Browser boundary: the in-app browser attempt remained blank with no captured runtime/network exception and unsupported native `webmcp_list_tools`; no browser success is claimed.

## Reproducibility and limitations

The exact source revision, deployment URL, and validation receipts belong in the final release status and in `docs/devpost-submission.md`. Re-run `npm run check`, inspect `git rev-parse HEAD`, fetch the public URL, and verify the Vercel deployment is READY before treating a release as current.

Known limitations are material: synthetic stops are not factual local listings; the planner omits travel time and hours; ranking weights are heuristic; no live-agent reliability sample or user study exists; native WebMCP inspection remains environment-blocked even though Chrome visual smoke and the six-width responsive matrix now pass; and the WebMCP API/specification may change before the challenge deadline. These limitations are part of the claim boundary, not hidden product behavior.
