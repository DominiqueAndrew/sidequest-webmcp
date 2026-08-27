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
