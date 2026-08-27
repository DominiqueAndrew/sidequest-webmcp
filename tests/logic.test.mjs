import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_BRIEF, STOPS } from '../src/data.js';
import { canFit, chooseStops, createPlan, formatMinutes, formatTimeOffset, searchStops, swapStop } from '../src/logic.js';

test('builds a varied route inside a gentle step-free brief', () => {
  const plan = createPlan(DEFAULT_BRIEF, 'test-plan');
  assert.equal(plan.id, 'test-plan');
  assert.equal(plan.stops.length, 3);
  assert.ok(plan.totalMinutes <= DEFAULT_BRIEF.durationMinutes);
  assert.ok(plan.totalCost <= DEFAULT_BRIEF.budget);
  assert.equal(new Set(plan.stops.map(({ stopId }) => STOPS.find((stop) => stop.id === stopId)?.category)).size, 3);
  assert.ok(plan.stops.every(({ stopId }) => STOPS.find((stop) => stop.id === stopId)?.stepFree));
});

test('filters tool-search results by hard constraints', () => {
  const results = searchStops({ energy: 'gentle', budget: 0, stepFree: true });
  assert.deepEqual(results.map((stop) => stop.id), ['canal-light-loop', 'maple-reading-room']);
  assert.ok(results.every((stop) => canFit(stop, { ...DEFAULT_BRIEF, budget: 0 })));
});

test('swaps one stop and resequences the route', () => {
  const plan = createPlan(DEFAULT_BRIEF, 'test-plan');
  const current = plan.stops[0]?.stopId;
  const replacement = STOPS.find((stop) => stop.category === 'coffee' && stop.id !== current)?.id;
  assert.equal(replacement, 'juniper-coffee');
  const next = swapStop(plan, current, replacement);
  assert.ok(next?.stops.map(({ stopId }) => stopId).includes(replacement));
  assert.equal(next?.stops[0]?.startMinute, 0);
  assert.ok(next?.totalMinutes <= DEFAULT_BRIEF.durationMinutes);
});

test('formats route times for the human-facing UI', () => { assert.equal(formatMinutes(85), '1 hr 25 min'); assert.equal(formatMinutes(120), '2 hr'); assert.equal(formatTimeOffset(25), '10:25'); });
test('returns the viable subset when fewer than three stops fit', () => { assert.equal(chooseStops({ ...DEFAULT_BRIEF, budget: 0, durationMinutes: 30 }).length, 1); });
test('fallback subsets still satisfy aggregate constraints', () => {
  const brief = { ...DEFAULT_BRIEF, budget: 0, durationMinutes: 30, stepFree: false };
  const plan = createPlan(brief, 'tight-plan');
  assert.ok(plan.totalMinutes <= brief.durationMinutes);
  assert.ok(plan.totalCost <= brief.budget);
});

test('swaps reject aggregate budget overflow and category loss', () => {
  const plan = createPlan(DEFAULT_BRIEF, 'test-plan');
  assert.equal(swapStop(plan, plan.stops[0].stopId, 'loom-lab'), null);
  assert.equal(swapStop(plan, plan.stops[0].stopId, 'canal-light-loop'), null);
});
