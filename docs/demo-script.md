# Sidequest demo script (target: 2:20)

Record the live URL with a clean browser window and your own voice. Keep the browser agent panel or tool inspector visible when it helps make the WebMCP calls legible. Do not use copyrighted music.

## 0:00–0:20 — The problem

“When I have a free hour, I want somewhere to go, not another research project. Sidequest asks for the shape of that window: time, energy, budget, and access.”

Show the initial Sidequest screen and the prefilled 90-minute, gentle, step-free brief.

## 0:20–0:45 — The human brief

Change the time to two hours and click “Build my route.” Let the loading state breathe for a moment, then show the three-stop route. Point out that the route reports its total time, total cost, and “It fits.”

## 0:45–1:30 — The agent uses the page

In ChatGPT’s in-app browser or a WebMCP-enabled Chrome session, say:

“Use Sidequest to inspect the current plan, search for a quiet step-free stop, and draft a gentle route under $18.”

Show the agent using `sidequest.inspect_plan`, `sidequest.search_stops`, and `sidequest.draft_plan`. The plan should update in the page, and the “Recent activity” rail should show the handoff.

## 1:30–1:55 — Keep the feeling, change one thing

Say:

“I want a different first stop, but keep the rest of the route. Search compatible coffee stops and swap the first one.”

Show `sidequest.search_stops` followed by `sidequest.swap_stop`. The first card changes; the other cards remain, and the timeline is resequenced.

## 1:55–2:15 — Human control

Say:

“Save this as A good little Saturday.”

Show the agent receiving the confirmation requirement from `sidequest.save_plan`. Say: “The agent can prepare the plan, but saving still needs my yes.” Confirm the save and show “Plan saved.”

## 2:15–2:20 — Close

“Sidequest is useful because WebMCP gives the agent the same structured state transitions as the human interface, while the person keeps the final say.”
