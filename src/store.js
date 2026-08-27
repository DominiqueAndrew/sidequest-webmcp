/** @typedef {import('./types.js').Activity} Activity */
/** @typedef {import('./types.js').Brief} Brief */
/** @typedef {import('./types.js').Plan} Plan */
import { DEFAULT_BRIEF } from './data.js';
import { createPlan, swapStop } from './logic.js';

function activity(source, label, detail) { return { id: `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`, source, label, detail, timestamp: Date.now() }; }

export function createInitialState() {
  return { brief: { ...DEFAULT_BRIEF }, plan: createPlan(DEFAULT_BRIEF, 'plan-saturday-demo'), savedPlans: [], activities: [activity('system', 'Brief loaded', 'A gentle, step-free 90-minute route is ready to tune.')], status: 'idle', error: null, webmcp: { mode: 'preview', toolCount: 5, error: null }, swapForStopId: null, saveRequest: null, saveApproval: false };
}

export function createStore(initial = createInitialState()) {
  let state = initial;
  const listeners = new Set();
  const notify = () => listeners.forEach((listener) => listener(state));
  const addActivity = (source, label, detail) => [activity(source, label, detail), ...state.activities].slice(0, 8);
  return {
    getState: () => state,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    setBrief: (brief, source = 'human') => { state = { ...state, brief: { ...brief }, plan: null, swapForStopId: null, saveRequest: null, saveApproval: false, error: null, activities: addActivity(source, 'Brief updated', `${brief.durationMinutes} minutes · ${brief.energy} energy · ${brief.stepFree ? 'step-free' : 'stairs okay'}.`) }; notify(); },
    beginBuild: (source = 'human') => { state = { ...state, status: 'building', error: null, activities: addActivity(source, 'Finding the right rhythm', 'Checking time, energy, cost, and access together.') }; notify(); },
    applyPlan: (plan, source = 'human', label = 'Draft ready', detail = `${plan.stops.length} stops fit your ${plan.totalMinutes}-minute window.`) => { state = { ...state, plan, status: 'idle', error: null, swapForStopId: null, saveRequest: null, saveApproval: false, activities: addActivity(source, label, detail) }; notify(); },
    setError: (message) => { state = { ...state, status: 'error', error: message, activities: addActivity('system', 'Could not finish that', message) }; notify(); },
    toggleSwap: (stopId) => { state = { ...state, swapForStopId: state.swapForStopId === stopId ? null : stopId }; notify(); },
    recordActivity: (source, label, detail) => { state = { ...state, activities: addActivity(source, label, detail) }; notify(); },
    replaceStop: (stopId, replacementId, source = 'human') => { if (!state.plan) return null; const next = swapStop(state.plan, stopId, replacementId); if (!next) return null; state = { ...state, plan: next, swapForStopId: null, saveRequest: null, saveApproval: false, activities: addActivity(source, 'One stop tuned', 'The rest of the route stayed intact.') }; notify(); return next; },
    requestSave: (name, source = 'human') => { if (!state.plan) return null; const title = typeof name === 'string' ? name.trim() || state.plan.title : state.plan.title; const request = { planId: state.plan.id, name: title, source }; state = { ...state, saveRequest: request, saveApproval: false, activities: addActivity(source, 'Save waiting for consent', source === 'agent' ? 'Review the plan and approve the save below.' : 'Review the plan before saving it.') }; notify(); return request; },
    approveSave: (source = 'human') => { if (!state.plan || state.saveRequest?.planId !== state.plan.id) return false; state = { ...state, saveApproval: true, activities: addActivity(source, 'Save approved', 'The plan is approved for its final save.') }; notify(); return true; },
    dismissSave: (source = 'human') => { if (!state.saveRequest) return false; state = { ...state, saveRequest: null, saveApproval: false, activities: addActivity(source, 'Kept as a draft', 'Nothing was added to saved plans.') }; notify(); return true; },
    savePlan: (name, source = 'human') => { if (!state.plan || !state.saveApproval || state.saveRequest?.planId !== state.plan.id) return null; const requestedName = state.saveRequest.name; const title = typeof name === 'string' ? name.trim() || requestedName : requestedName; const saved = { ...state.plan, title, status: 'saved' }; state = { ...state, plan: saved, savedPlans: [saved, ...state.savedPlans.filter((plan) => plan.id !== saved.id)], saveRequest: null, saveApproval: false, activities: addActivity(source, 'Plan saved', 'Your Saturday is ready when you are.') }; notify(); return saved; },
    setWebmcp: (webmcp) => { state = { ...state, webmcp }; notify(); },
    reset: () => { const webmcp = state.webmcp; state = { ...createInitialState(), plan: null, webmcp, activities: [activity('human', 'Fresh start', 'Tell me the shape of your free time and we’ll begin there.')] }; notify(); },
  };
}
