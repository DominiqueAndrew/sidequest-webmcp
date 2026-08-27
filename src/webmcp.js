import { searchStops, createPlan, swapStop } from './logic.js';

const CATEGORIES = ['coffee', 'wander', 'maker', 'quiet'];
const ENERGIES = ['bright', 'balanced', 'gentle'];

function asObject(input) {
  return typeof input === 'object' && input !== null ? input : {};
}

function json(value) {
  return Promise.resolve(JSON.stringify(value));
}

function boundedString(value, maxLength) {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

function boundedNumber(value, minimum, maximum, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum || (integer && !Number.isInteger(value))) return undefined;
  return value;
}

function enumValue(value, values) {
  return values.includes(value) ? value : undefined;
}

function briefFrom(input, fallback) {
  return {
    start: boundedString(input.start, 60) ?? fallback.start,
    durationMinutes: boundedNumber(input.durationMinutes, 30, 240, true) ?? fallback.durationMinutes,
    energy: enumValue(input.energy, ENERGIES) ?? fallback.energy,
    budget: boundedNumber(input.budget, 0, 100) ?? fallback.budget,
    stepFree: typeof input.stepFree === 'boolean' ? input.stepFree : fallback.stepFree,
  };
}

export function buildTools(store) {
  return [
    {
      name: 'sidequest.search_stops',
      title: 'Search stops',
      description: "Find curated places that fit a person's time, energy, budget, and access needs. Use this before drafting or swapping a route.",
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', maxLength: 80, description: 'A place, neighborhood, or feeling to search for.' },
          category: { type: 'string', enum: CATEGORIES, description: 'The kind of stop to find.' },
          durationMinutes: { type: 'integer', minimum: 5, maximum: 240, description: 'Maximum time available for this stop.' },
          budget: { type: 'number', minimum: 0, maximum: 100, description: 'Maximum spend for this stop in local currency.' },
          energy: { type: 'string', enum: ENERGIES, description: 'Maximum energy level.' },
          stepFree: { type: 'boolean', description: 'Whether the stop must be step-free.' },
        },
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => {
        const values = asObject(input);
        const results = searchStops({
          query: boundedString(values.query, 80),
          category: enumValue(values.category, CATEGORIES),
          durationMinutes: boundedNumber(values.durationMinutes, 5, 240, true),
          budget: boundedNumber(values.budget, 0, 100),
          energy: enumValue(values.energy, ENERGIES),
          stepFree: values.stepFree === true,
        });
        store.recordActivity('agent', 'Searched the collection', `${results.length} compatible ${results.length === 1 ? 'stop' : 'stops'} found.`);
        return json({ results: results.map(({ id, name, neighborhood, category, durationMinutes, price, stepFree, description, tags }) => ({ id, name, neighborhood, category, durationMinutes, price, stepFree, description, tags })) });
      },
    },
    {
      name: 'sidequest.draft_plan',
      title: 'Draft a route',
      description: "Build a coherent mini-adventure from the person's current brief. Balance distinct stops while respecting time, budget, energy, and step-free constraints.",
      inputSchema: {
        type: 'object',
        properties: {
          start: { type: 'string', maxLength: 60, description: 'Where the person wants to begin.' },
          durationMinutes: { type: 'integer', minimum: 30, maximum: 240, description: 'The total time window.' },
          energy: { type: 'string', enum: ENERGIES, description: 'The desired energy level.' },
          budget: { type: 'number', minimum: 0, maximum: 100, description: 'Maximum total spend.' },
          stepFree: { type: 'boolean', description: 'Whether every stop must be step-free.' },
        },
        required: ['durationMinutes'],
      },
      execute: async (input) => {
        const brief = briefFrom(asObject(input), store.getState().brief);
        store.setBrief(brief, 'agent');
        store.beginBuild('agent');
        const plan = createPlan(brief, `plan-agent-${Date.now()}`);
        store.applyPlan(plan, 'agent');
        return json({ ok: true, plan });
      },
    },
    {
      name: 'sidequest.swap_stop',
      title: 'Tune one stop',
      description: 'Swap one stop in the current draft for another compatible option while keeping the rest of the route intact. Use a replacementId from search_stops when possible.',
      inputSchema: {
        type: 'object',
        properties: {
          stopId: { type: 'string', maxLength: 80, description: 'The id of the current stop to replace.' },
          replacementId: { type: 'string', maxLength: 80, description: 'The id of a compatible stop from search_stops.' },
        },
        required: ['stopId'],
      },
      execute: async (input) => {
        const values = asObject(input);
        const stopId = boundedString(values.stopId, 80);
        const replacementId = boundedString(values.replacementId, 80);
        const plan = store.getState().plan;
        if (!plan || !stopId) return json({ ok: false, error: 'There is no draft stop to swap yet.' });
        const next = swapStop(plan, stopId, replacementId);
        if (!next) return json({ ok: false, error: 'No compatible replacement fits the current brief.' });
        store.applyPlan(next, 'agent', 'One stop tuned', 'The rest of the route stayed intact.');
        return json({ ok: true, plan: next });
      },
    },
    {
      name: 'sidequest.inspect_plan',
      title: 'Inspect the current plan',
      description: "Read the person's current brief and draft so you can make a context-aware next suggestion without guessing what is on screen.",
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => {
        const state = store.getState();
        store.recordActivity('agent', 'Read the current plan', state.plan ? 'The agent received the live brief and draft.' : 'The agent received the live brief; no draft exists yet.');
        return json({ brief: state.brief, plan: state.plan, savedPlans: state.savedPlans.length });
      },
    },
    {
      name: 'sidequest.save_plan',
      title: 'Save the plan',
      description: "Save the reviewed adventure under a name. This changes the person's saved plans, so ask for confirmation before calling with confirm true.",
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 60, description: 'A short name for the plan.' },
          confirm: { type: 'boolean', description: 'True only after the person explicitly confirms saving.' },
        },
        required: ['name', 'confirm'],
      },
      execute: async (input) => {
        const values = asObject(input);
        if (values.confirm !== true) {
          store.recordActivity('agent', 'Save waiting for consent', 'The agent asked before changing saved plans.');
          return json({ ok: false, requiresConfirmation: true, message: 'Ask the person to confirm before saving this plan.' });
        }
        const saved = store.savePlan(boundedString(values.name, 60) ?? 'My Saturday', 'agent');
        return json(saved ? { ok: true, saved } : { ok: false, error: 'There is no draft plan to save.' });
      },
    },
  ];
}

export async function registerWebMcp(store) {
  const tools = buildTools(store);
  if (document.modelContext?.registerTool) {
    for (const tool of tools) await document.modelContext.registerTool(tool);
    return { mode: 'native', toolCount: tools.length };
  }
  if (navigator.modelContext?.provideContext) {
    navigator.modelContext.provideContext({ tools });
    return { mode: 'legacy', toolCount: tools.length };
  }
  return { mode: 'preview', toolCount: tools.length };
}
