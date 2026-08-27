/** @typedef {import('./types.js').Brief} Brief */
/** @typedef {import('./types.js').Stop} Stop */
/** @typedef {import('./types.js').Plan} Plan */
/** @typedef {import('./types.js').StopCategory} StopCategory */
import { DEFAULT_BRIEF, ENERGY_LABELS, STOPS, getStop } from './data.js';

const ENERGY_RANK = { gentle: 0, balanced: 1, bright: 2 };
const CATEGORY_ORDER = ['coffee', 'wander', 'quiet', 'maker'];

/** @param {Stop} stop @param {Brief} brief */
export function canFit(stop, brief) {
  return stop.durationMinutes <= brief.durationMinutes && stop.price <= brief.budget && (!brief.stepFree || stop.stepFree) && ENERGY_RANK[stop.energy] <= ENERGY_RANK[brief.energy];
}

/** @param {Partial<Brief> & {category?: StopCategory, query?: string}} [filters] @returns {Stop[]} */
export function searchStops(filters = {}) {
  const query = filters.query?.trim().toLowerCase();
  return STOPS.filter((stop) => {
    if (filters.category && stop.category !== filters.category) return false;
    if (typeof filters.durationMinutes === 'number' && stop.durationMinutes > filters.durationMinutes) return false;
    if (typeof filters.budget === 'number' && stop.price > filters.budget) return false;
    if (filters.stepFree && !stop.stepFree) return false;
    if (filters.energy && ENERGY_RANK[stop.energy] > ENERGY_RANK[filters.energy]) return false;
    if (query && ![stop.name, stop.neighborhood, stop.description, ...stop.tags].join(' ').toLowerCase().includes(query)) return false;
    return true;
  });
}

/** @template T @param {T[]} items @param {number} size @returns {T[][]} */
function combinations(items, size) {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  return [...combinations(rest, size - 1).map((combination) => [first, ...combination]), ...combinations(rest, size)];
}

/** @param {Stop[]} stops @param {Brief} brief */
function scoreCombination(stops, brief) {
  const totalMinutes = stops.reduce((sum, stop) => sum + stop.durationMinutes, 0);
  const totalCost = stops.reduce((sum, stop) => sum + stop.price, 0);
  const categoryBonus = new Set(stops.map((stop) => stop.category)).size * 14;
  const timeFit = Math.max(0, 40 - Math.abs(brief.durationMinutes - totalMinutes));
  const budgetFit = Math.max(0, 18 - Math.abs(brief.budget - totalCost));
  const gentleBonus = brief.energy === 'gentle' && stops.every((stop) => stop.energy === 'gentle') ? 12 : 0;
  return categoryBonus + timeFit + budgetFit + gentleBonus;
}

/** @param {Brief} brief @param {string[]} [excludedIds] @returns {Stop[]} */
export function chooseStops(brief, excludedIds = []) {
  const candidates = searchStops(brief).filter((stop) => !excludedIds.includes(stop.id));
  const valid = combinations(candidates, 3).filter((combo) => combo.reduce((sum, stop) => sum + stop.durationMinutes, 0) <= brief.durationMinutes && combo.reduce((sum, stop) => sum + stop.price, 0) <= brief.budget && new Set(combo.map((stop) => stop.category)).size === 3);
  const ranked = valid.sort((a, b) => scoreCombination(b, brief) - scoreCombination(a, brief));
  if (ranked[0]) return CATEGORY_ORDER.map((category) => ranked[0].find((stop) => stop.category === category)).filter(Boolean);
  return candidates.slice(0, 3);
}

/** @param {Brief} brief @param {string} [id] @returns {Plan} */
export function createPlan(brief, id = `plan-${Date.now()}`) {
  const chosen = chooseStops(brief);
  let cursor = 0;
  const stops = chosen.map((stop, index) => {
    const startMinute = cursor;
    cursor += stop.durationMinutes;
    return { stopId: stop.id, startMinute, endMinute: cursor, note: index === 0 ? 'Arrive gently' : index === chosen.length - 1 ? 'Leave with a little more room' : 'Let the day breathe' };
  });
  return { id, title: `${ENERGY_LABELS[brief.energy]} Saturday`, brief: { ...brief }, stops, totalMinutes: cursor, totalCost: chosen.reduce((sum, stop) => sum + stop.price, 0), status: 'draft' };
}

/** @param {Plan} plan @param {string} stopId @param {string} [replacementId] @returns {Plan|null} */
export function swapStop(plan, stopId, replacementId) {
  if (!getStop(stopId)) return null;
  const excluded = plan.stops.map(({ stopId: id }) => id).filter((id) => id !== stopId);
  const replacement = replacementId ? getStop(replacementId) : chooseStops(plan.brief, excluded).find((stop) => stop.id !== stopId);
  if (!replacement || excluded.includes(replacement.id) || !canFit(replacement, plan.brief)) return null;
  const next = plan.stops.map((planned) => planned.stopId === stopId ? { ...planned, stopId: replacement.id } : planned);
  const chosen = next.map(({ stopId: id }) => getStop(id)).filter(Boolean);
  if (chosen.reduce((sum, stop) => sum + stop.durationMinutes, 0) > plan.brief.durationMinutes) return null;
  let cursor = 0;
  const resequenced = next.map((planned) => { const stop = getStop(planned.stopId); const startMinute = cursor; cursor += stop?.durationMinutes ?? 0; return { ...planned, startMinute, endMinute: cursor }; });
  return { ...plan, stops: resequenced, totalMinutes: cursor, totalCost: chosen.reduce((sum, stop) => sum + stop.price, 0), status: 'draft' };
}

export function formatMinutes(minutes) { if (minutes < 60) return `${minutes} min`; const hours = Math.floor(minutes / 60); const remainder = minutes % 60; return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`; }
export function formatTimeOffset(minutes) { return `${10 + Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`; }
export { DEFAULT_BRIEF };
