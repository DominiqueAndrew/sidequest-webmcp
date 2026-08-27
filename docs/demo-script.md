# Sidequest demo script (target: 2:20)

Record the live URL with a clean browser window and your own voice. This is a human planner with an agent handoff, not a chatbot demo. Keep the browser agent panel or tool inspector visible when it helps make the WebMCP calls legible. Do not use copyrighted music.

## 0:00–0:20 — The problem

“When I have a free hour, I want somewhere to go, not another research project. Sidequest asks for the shape of that window: time, energy, budget, and access.”

Show the initial Sidequest screen and the prefilled 90-minute, gentle, step-free brief. If the status does not say “WebMCP ready” in a WebMCP-enabled browser, stop and fix the browser setup rather than implying native tool support.

## 0:20–0:45 — The human brief

Change the time to two hours and click “Build my route.” Let the loading state breathe for a moment, then show the three-stop route. Point out that the route reports its total time, total cost, and “It fits.”

## 0:45–1:30 — The agent uses the page

In ChatGPT’s in-app browser or a WebMCP-enabled Chrome session, say:

“Use Sidequest to inspect the current plan, search for a quiet step-free stop, and draft a gentle route under $18.”

Show the agent using `sidequest.inspect_plan`, `sidequest.search_stops`, and `sidequest.draft_plan`. Point out that inspect returns the live brief, draft, and constraint receipt, search returns structured compatible candidates, and draft updates the same visible plan. The “Recent activity” rail should show the handoff.

## 1:30–1:55 — Keep the feeling, change one thing

Say:

“I want a different first stop, but keep the rest of the route. Search compatible coffee stops and swap the first one.”

Show `sidequest.search_stops` followed by `sidequest.swap_stop`. Use the coffee result as the replacement. The first card changes; the other cards remain, and the timeline is resequenced. This is the key proof that the agent is operating on a stateful route, not clicking arbitrary labels.

## 1:55–2:15 — Human control

Say:

“Save this as A good little Saturday.”

Show the agent receiving the confirmation requirement from `sidequest.save_plan` with `confirm: false`; no saved plan should appear and the page should show its approval card. Say: “The agent can prepare the plan, but saving still needs my yes.” Click “Approve for agent,” then confirm the save with `confirm: true` and show “Plan saved.” If demonstrating the normal human UI instead, use “Save this plan” followed by “Approve & save.”

## 2:15–2:20 — Close

“Sidequest is useful because WebMCP gives the agent the same structured state transitions as the human interface, while the person keeps the final say.”

## Recording checklist

- Verify the live URL, native WebMCP status, and five tools in the browser inspector before recording.
- Keep the route totals, activity rail, and confirmation response readable on screen.
- Keep the final video public, under three minutes, with spoken audio and no copyrighted music or third-party marks.
- Do not claim live availability: the collection is synthetic demo data.
