/** @typedef {import('./types.js').Activity} Activity */
/** @typedef {import('./types.js').Brief} Brief */
/** @typedef {import('./types.js').Plan} Plan */
import { DEFAULT_BRIEF } from './data.js';
import { createPlan, swapStop } from './logic.js';

function activity(source, label, detail) { return { id: `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`, source, label, detail, timestamp: Date.now() }; }

export function createInitialState() {
  return { brief: { ...DEFAULT_BRIEF }, plan: createPlan(DEFAULT_BRIEF, 'plan-saturday-demo'), savedPlans: [], activities: [activity('system', 'Brief loaded', 'A gentle, step-free 90-minute route is ready to tune.')], status: 'idle', error: null, webmcp: { mode: 'preview', toolCount: 5 }, swapForStopId: null };
}

export function createStore(initial = createInitialState()) {
  let state = initial;
  const listeners = new Set();
  const notify = () => listeners.forEach((listener) => listener(state));
  const addActivity = (source, label, detail) => [activity(source, label, detail), ...state.activities].slice(0, 8);
  return {
    getState: () => state,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    setBrief: (brief, source = 'human') => { state = { ...state, brief: { ...brief }, plan: null, swapForStopId: null, error: null, activities: addActivity(source, 'Brief updated', `${brief.durationMinutes} minutes · ${brief.energy} energy · ${brief.stepFree ? 'step-free' : 'stairs okay'}.`) }; notify(); },
    beginBuild: (source = 'human') => { state = { ...state, status: 'building', error: null, activities: addActivity(source, 'Finding the right rhythm', 'Checking time, energy, cost, and access together.') }; notify(); },
    applyPlan: (plan, source = 'human') => { state = { ...state, plan, status: 'idle', error: null, swapForStopId: null, activities: addActivity(source, 'Draft ready', `${plan.stops.length} stops fit your ${plan.totalMinutes}-minute window.`) }; notify(); },
    setError: (message) => { state = { ...state, status: 'error', error: message, activities: addActivity('system', 'Could not finish that', message) }; notify(); },
    toggleSwap: (stopId) => { state = { ...state, swapForStopId: state.swapForStopId === stopId ? null : stopId }; notify(); },
    replaceStop: (stopId, replacementId, source = 'human') => { if (!state.plan) return null; const next = swapStop(state.plan, stopId, replacementId); if (!next) return null; state = { ...state, plan: next, swapForStopId: null, activities: addActivity(source, 'One stop tuned', 'The rest of the route stayed intact.') }; notify(); return next; },
    savePlan: (name, source = 'human') => { if (!state.plan) return null; const saved = { ...state.plan, title: name.trim() || state.plan.title, status: 'saved' }; state = { ...state, plan: saved, savedPlans: [saved, ...state.savedPlans.filter((plan) => plan.id !== saved.id)], activities: addActivity(source, 'Plan saved', 'Your Saturday is ready when you are.') }; notify(); return saved; },
    setWebmcp: (webmcp) => { state = { ...state, webmcp }; notify(); },
    reset: () => { const webmcp = state.webmcp; state = { ...createInitialState(), webmcp }; notify(); },
  };
}
