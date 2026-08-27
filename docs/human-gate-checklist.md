# Sidequest — human-gate checklist

This is the smallest action pack for the remaining gates. It contains actions that require a person’s browser, account, voice, eligibility, agreements, or final submission authority. Do not treat local tests or Chrome visual smoke as native WebMCP acceptance.

## 1. Native WebMCP browser acceptance

Use one of these supported paths:

- ChatGPT desktop’s in-app browser, where WebMCP is available by default.
- Chrome 149 or newer. Check the exact version at `chrome://version`, open `chrome://flags/#enable-webmcp-testing`, set the flag to **Enabled**, relaunch Chrome, and use a fresh tab.

Open the live URL: <https://sidequest-webmcp.vercel.app>

Expected page evidence:

- The page renders Sidequest, shows `WebMCP ready` and `5 tools live`, and does not remain blank.
- The browser’s WebMCP inspection surface lists these five tools: `sidequest.search_stops`, `sidequest.draft_plan`, `sidequest.swap_stop`, `sidequest.inspect_plan`, and `sidequest.save_plan`.
- Each tool exposes a JSON Schema and an executable callback. `search_stops` and `inspect_plan` are read-only; `save_plan` is the only state-changing tool.

Use this short agent script:

1. “Use Sidequest to inspect the current plan and brief.”
2. “I have 90 minutes near Riverside, want a gentle step-free plan under $18. Search for a quiet coffee stop, then draft the best route.”
3. “Swap the first stop for the other compatible coffee option and show me the revised plan.”
4. “Save this as A good little Saturday.”

If the browser inspector offers manual invocation, the equivalent bounded inputs are:

```text
sidequest.inspect_plan {}
sidequest.search_stops {"category":"coffee","energy":"gentle","budget":18,"stepFree":true}
sidequest.draft_plan {"start":"Riverside","durationMinutes":90,"energy":"gentle","budget":18,"stepFree":true}
sidequest.inspect_plan {}
sidequest.swap_stop {"stopId":"juniper-coffee","replacementId":"pigeon-pine-bakery"}
sidequest.save_plan {"name":"A good little Saturday","confirm":false}
```

Use the stop IDs returned by `search_stops` if the live draft differs; do not invent an ID. After the page approval, repeat only the final call with `"confirm":true`.

For the save gate, the first `sidequest.save_plan` call must use `confirm: false`. Expected result: a structured confirmation requirement, no saved plan, and a visible page request. Click **Approve for agent** in Sidequest. Only then should the agent call `sidequest.save_plan` with `confirm: true`; expected result: one saved plan and visible `Plan saved`. If the person changes the route before confirmation, the old approval must no longer authorize the new plan.

Capture or record:

- browser name/version or ChatGPT desktop path;
- the five discovered tool names and schemas;
- structured results for inspect, search, draft, swap, denied save, approval, and confirmed save;
- the before/after approval state and the final saved-plan state;
- the tested URL and, if available, the Vercel deployment identifier.

Fallback: if the ChatGPT browser is blank, reports no captured runtime/console/network exception, or does not support `webmcp_list_tools`, stop that path after one bounded attempt and record the limitation. Use Chrome 149+ with the testing flag instead. If an authorized Chrome/WebMCP environment is unavailable, leave this gate unchecked; the local contract tests and ordinary Chrome visual smoke are supporting evidence only.

## 2. Public demo video

Use [`demo-script.md`](demo-script.md). Record the live workflow in about 2:20, with the speaker’s own explanatory audio, including why the structured tools matter and why the person approves the save. Upload a public YouTube video shorter than three minutes. Do not use copyrighted music, third-party marks, or material without permission.

Expected evidence: public YouTube URL, duration under 3:00, audible explanation, live URL shown, and the WebMCP handoff visible. If recording or upload is unavailable, keep the field as `TBD`.

## 3. Eligibility and agreements

The human entrant must personally check the official rules for age of majority where they reside, supported country, conflict restrictions, originality/IP, team representation, and any required Devpost agreements. Do not accept agreements or attest on another person’s behalf.

## 4. Final Devpost submission

After the preceding gates pass, attach the live URL, public repository, MIT license, English project materials, evidence appendix, and public video. Confirm that the project remains free and accessible through judging. Review the provenance boundary in [`SCIENCE_APPENDIX.md`](../SCIENCE_APPENDIX.md), then the human entrant submits and reads back the successful Devpost confirmation. Until that read-back exists, no submission is claimed.

Official source: <https://webmcp.devpost.com/rules>
