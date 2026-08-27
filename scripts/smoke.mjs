import assert from 'node:assert/strict';
import { buildTools } from '../src/webmcp.js';
import { createStore } from '../src/store.js';

const store = createStore();
const tools = buildTools(store);
const tool = (name) => {
  const found = tools.find((candidate) => candidate.name === name);
  assert.ok(found, `missing tool: ${name}`);
  return found;
};
const run = async (name, input) => JSON.parse(await tool(name).execute(input));
const brief = { start: 'Riverside', durationMinutes: 90, energy: 'gentle', budget: 18, stepFree: true };

const inspectedBefore = await run('sidequest.inspect_plan', {});
assert.ok(inspectedBefore.plan, 'the initial human draft should be inspectable');

const search = await run('sidequest.search_stops', { category: 'coffee', ...brief });
assert.equal(search.results.length, 2, 'the constrained coffee search should return two demo stops');

const drafted = await run('sidequest.draft_plan', brief);
assert.equal(drafted.ok, true);
assert.equal(drafted.plan.totalMinutes <= brief.durationMinutes, true);
assert.equal(drafted.plan.totalCost <= brief.budget, true);
const beforeIds = drafted.plan.stops.map(({ stopId }) => stopId);
const replacementId = search.results.find(({ id }) => id !== beforeIds[0])?.id;
assert.ok(replacementId, 'the constrained search should provide a replacement');

const inspectedAfter = await run('sidequest.inspect_plan', {});
assert.deepEqual(inspectedAfter.plan.stops.map(({ stopId }) => stopId), beforeIds);
assert.deepEqual(inspectedAfter.constraintChecks, { timeFits: true, budgetFits: true, energyFits: true, accessFits: true, distinctCategories: 3, varietyFits: true });

const swapped = await run('sidequest.swap_stop', { stopId: beforeIds[0], replacementId });
assert.equal(swapped.ok, true);
assert.deepEqual(swapped.plan.stops.slice(1).map(({ stopId }) => stopId), beforeIds.slice(1));

const denied = await run('sidequest.save_plan', { name: 'A good little Saturday', confirm: false });
assert.deepEqual(denied, { ok: false, requiresConfirmation: true, message: 'Ask the person to approve the save in Sidequest, then call again with confirm true.' });
assert.equal(store.getState().savedPlans.length, 0);

const premature = await run('sidequest.save_plan', { name: 'A good little Saturday', confirm: true });
assert.equal(premature.requiresConfirmation, true);
assert.equal(store.getState().savedPlans.length, 0);
assert.equal(store.approveSave('human'), true);
const saved = await run('sidequest.save_plan', { name: 'A good little Saturday', confirm: true });
assert.equal(saved.ok, true);
assert.equal(store.getState().savedPlans.length, 1);

store.reset();
assert.equal(store.getState().plan, null);
assert.equal(store.getState().activities[0].label, 'Fresh start');

const route = swapped.plan;
console.log(JSON.stringify({
  workflow: ['inspect_plan', 'search_stops', 'draft_plan', 'inspect_plan', 'swap_stop', 'save_plan(false)', 'human_approve_save', 'save_plan(true)', 'reset'],
  search: { category: 'coffee', resultCount: search.results.length },
  draft: { stopCount: route.stops.length, stopIds: route.stops.map(({ stopId }) => stopId), totalMinutes: route.totalMinutes, totalCost: route.totalCost, constraintChecks: inspectedAfter.constraintChecks },
  save: { deniedRequiresConfirmation: denied.requiresConfirmation, prematureConfirmDenied: premature.requiresConfirmation, savedCountAfterDeny: 0, humanApproved: true, confirmed: saved.ok },
  reset: { planIsNull: true, activity: 'Fresh start' },
}, null, 2));
