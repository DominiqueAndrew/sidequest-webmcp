import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTools, registerWebMcp } from '../src/webmcp.js';
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
  const inspect = tools.find((tool) => tool.name === 'sidequest.inspect_plan');
  const save = tools.find((tool) => tool.name === 'sidequest.save_plan');
  assert.equal(search.annotations.readOnlyHint, true);
  assert.equal(inspect.annotations.readOnlyHint, true);
  assert.equal(save.annotations?.readOnlyHint, undefined);
  const searchResult = JSON.parse(await search.execute({ energy: 'gentle', budget: 0, stepFree: true }));
  assert.deepEqual(searchResult.results.map((stop) => stop.id), ['canal-light-loop', 'maple-reading-room']);
  assert.equal(store.getState().activities[0].label, 'Searched the collection');
});

test('registers the native WebMCP contract without changing tool payloads', async () => {
  const registered = [];
  const previousDocument = globalThis.document;
  globalThis.document = { modelContext: { registerTool: async (tool) => registered.push(tool) } };
  try {
    const status = await registerWebMcp(createStore());
    assert.deepEqual(status, { mode: 'native', toolCount: 5 });
    assert.deepEqual(registered.map((tool) => tool.name), [
      'sidequest.search_stops',
      'sidequest.draft_plan',
      'sidequest.swap_stop',
      'sidequest.inspect_plan',
      'sidequest.save_plan',
    ]);
    assert.ok(registered.every((tool) => tool.inputSchema.type === 'object' && typeof tool.execute === 'function'));
    assert.deepEqual(registered.filter((tool) => tool.annotations?.readOnlyHint).map((tool) => tool.name), ['sidequest.search_stops', 'sidequest.inspect_plan']);
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test('surfaces native registration rejection to the runtime boundary', async () => {
  const previousDocument = globalThis.document;
  globalThis.document = { modelContext: { registerTool: async () => { throw new Error('registration failed'); } } };
  try {
    await assert.rejects(() => registerWebMcp(createStore()), /registration failed/);
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
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
  assert.equal(store.getState().saveRequest.source, 'agent');
  assert.equal(store.getState().saveApproval, false);
  const nonBoolean = JSON.parse(await save.execute({ name: 'A good little Saturday', confirm: 'true' }));
  assert.equal(nonBoolean.requiresConfirmation, true);
  assert.equal(store.getState().savedPlans.length, 0);
  const premature = JSON.parse(await save.execute({ name: 'A good little Saturday', confirm: true }));
  assert.equal(premature.requiresConfirmation, true);
  assert.equal(store.getState().savedPlans.length, 0);
  assert.equal(store.approveSave('human'), true);
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
  assert.deepEqual(inspected.constraintChecks, { timeFits: true, budgetFits: true, energyFits: true, accessFits: true, distinctCategories: 3, varietyFits: true });
  const result = JSON.parse(await swap.execute({ stopId: before[0], replacementId: 'juniper-coffee' }));
  assert.equal(result.ok, true);
  assert.deepEqual(store.getState().plan.stops.slice(1).map(({ stopId }) => stopId), before.slice(1));
  assert.equal(store.getState().activities[0].label, 'One stop tuned');
});

test('tool schemas and callbacks bound malformed agent input', async () => {
  const store = createStore();
  const tools = buildTools(store);
  const search = tools.find((tool) => tool.name === 'sidequest.search_stops');
  const draft = tools.find((tool) => tool.name === 'sidequest.draft_plan');
  const save = tools.find((tool) => tool.name === 'sidequest.save_plan');
  assert.equal(search.inputSchema.properties.query.maxLength, 80);
  assert.equal(draft.inputSchema.properties.start.maxLength, 60);
  assert.equal(save.inputSchema.properties.name.maxLength, 60);
  const searchResult = JSON.parse(await search.execute({ query: ' '.repeat(200), durationMinutes: Number.NaN, budget: Number.POSITIVE_INFINITY }));
  assert.ok(Array.isArray(searchResult.results));
  const drafted = JSON.parse(await draft.execute({ start: 'x'.repeat(200), durationMinutes: Number.POSITIVE_INFINITY, budget: -1 }));
  assert.equal(drafted.plan.brief.start.length, 60);
  assert.equal(drafted.plan.brief.durationMinutes, 90);
  assert.equal(drafted.plan.brief.budget, 18);
  const requested = JSON.parse(await save.execute({ name: 'n'.repeat(200), confirm: false }));
  assert.equal(requested.requiresConfirmation, true);
  assert.equal(store.approveSave('human'), true);
  const saved = JSON.parse(await save.execute({ name: 'n'.repeat(200), confirm: true }));
  assert.equal(saved.saved.title.length, 60);
});

test('save approval is invalidated when the reviewed plan changes', async () => {
  const store = createStore();
  const tools = buildTools(store);
  const draft = tools.find((tool) => tool.name === 'sidequest.draft_plan');
  const save = tools.find((tool) => tool.name === 'sidequest.save_plan');
  const swap = tools.find((tool) => tool.name === 'sidequest.swap_stop');
  await draft.execute({ durationMinutes: 90, energy: 'gentle', budget: 18, stepFree: true });
  await save.execute({ name: 'A reviewed Saturday', confirm: false });
  assert.equal(store.approveSave('human'), true);
  const stopId = store.getState().plan.stops[0].stopId;
  const replacementId = stopId === 'juniper-coffee' ? 'canal-light-loop' : 'juniper-coffee';
  const swapped = JSON.parse(await swap.execute({ stopId, replacementId }));
  assert.equal(swapped.ok, true);
  assert.equal(store.getState().saveApproval, false);
  const denied = JSON.parse(await save.execute({ name: 'A reviewed Saturday', confirm: true }));
  assert.equal(denied.requiresConfirmation, true);
  assert.equal(store.getState().savedPlans.length, 0);
});

test('reset exposes a real blank state for the human workflow', () => {
  const store = createStore();
  assert.ok(store.getState().plan);
  store.reset();
  assert.equal(store.getState().plan, null);
  assert.equal(store.getState().activities[0].label, 'Fresh start');
});
