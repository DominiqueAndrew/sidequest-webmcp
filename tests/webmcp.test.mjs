import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTools } from '../src/webmcp.js';
import { createStore } from '../src/store.js';

test('exposes the complete stateful WebMCP tool surface', async () => {
  const store = createStore();
  const tools = buildTools(store);
  assert.deepEqual(tools.map((tool) => tool.name), [
    'sidequest.search_stops',
    'sidequest.draft_plan',
    'sidequest.swap_stop',
    'sidequest.inspect_plan',
    'sidequest.save_plan',
  ]);
  assert.ok(tools.every((tool) => tool.description && tool.inputSchema.type === 'object' && typeof tool.execute === 'function'));

  const search = tools.find((tool) => tool.name === 'sidequest.search_stops');
  const searchResult = JSON.parse(await search.execute({ energy: 'gentle', budget: 0, stepFree: true }));
  assert.deepEqual(searchResult.results.map((stop) => stop.id), ['canal-light-loop', 'maple-reading-room']);
  assert.equal(store.getState().activities[0].label, 'Searched the collection');
});

test('agent drafting mutates the shared page state and saving is consent-gated', async () => {
  const store = createStore();
  const tools = buildTools(store);
  const draft = tools.find((tool) => tool.name === 'sidequest.draft_plan');
  const save = tools.find((tool) => tool.name === 'sidequest.save_plan');
  const draftResult = JSON.parse(await draft.execute({ durationMinutes: 90, energy: 'gentle', budget: 18, stepFree: true }));
  assert.equal(draftResult.ok, true);
  assert.equal(store.getState().plan.id.startsWith('plan-agent-'), true);

  const denied = JSON.parse(await save.execute({ name: 'A good little Saturday', confirm: false }));
  assert.equal(denied.requiresConfirmation, true);
  assert.equal(store.getState().savedPlans.length, 0);
  const saved = JSON.parse(await save.execute({ name: 'A good little Saturday', confirm: true }));
  assert.equal(saved.ok, true);
  assert.equal(store.getState().savedPlans.length, 1);
});

test('agent inspection and tuning operate on the same live route', async () => {
  const store = createStore();
  const tools = buildTools(store);
  const draft = tools.find((tool) => tool.name === 'sidequest.draft_plan');
  const inspect = tools.find((tool) => tool.name === 'sidequest.inspect_plan');
  const swap = tools.find((tool) => tool.name === 'sidequest.swap_stop');
  await draft.execute({ durationMinutes: 90, energy: 'gentle', budget: 18, stepFree: true });
  const before = store.getState().plan.stops.map(({ stopId }) => stopId);
  const inspected = JSON.parse(await inspect.execute({}));
  assert.deepEqual(inspected.plan.stops.map(({ stopId }) => stopId), before);
  const result = JSON.parse(await swap.execute({ stopId: before[0], replacementId: 'juniper-coffee' }));
  assert.equal(result.ok, true);
  assert.deepEqual(store.getState().plan.stops.slice(1).map(({ stopId }) => stopId), before.slice(1));
  assert.equal(store.getState().activities[0].label, 'One stop tuned');
});

test('reset exposes a real blank state for the human workflow', () => {
  const store = createStore();
  assert.ok(store.getState().plan);
  store.reset();
  assert.equal(store.getState().plan, null);
  assert.equal(store.getState().activities[0].label, 'Fresh start');
});
