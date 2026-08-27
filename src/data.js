/** @typedef {import('./types.js').Brief} Brief */
/** @typedef {import('./types.js').Energy} Energy */
/** @typedef {import('./types.js').Stop} Stop */

/** @type {Brief} */
export const DEFAULT_BRIEF = { start: 'Riverside', durationMinutes: 90, energy: 'gentle', budget: 18, stepFree: true };

/** @type {Record<Energy, string>} */
export const ENERGY_LABELS = { gentle: 'Gentle', balanced: 'Balanced', bright: 'Bright' };

/** @type {Stop[]} */
export const STOPS = [
  { id: 'juniper-coffee', name: 'Juniper Coffee', neighborhood: 'North Quay', category: 'coffee', categoryLabel: 'A good start', durationMinutes: 20, price: 8, energy: 'gentle', stepFree: true, description: 'A corner table, a cardamom bun, and enough quiet to arrive.', color: 'clay', tags: ['warm', 'quiet', 'treat'] },
  { id: 'canal-light-loop', name: 'Canal Light Loop', neighborhood: 'East Canal', category: 'wander', categoryLabel: 'A little outside', durationMinutes: 40, price: 0, energy: 'gentle', stepFree: true, description: 'A waterside loop with benches, reeds, and one excellent view.', color: 'sage', tags: ['outdoors', 'water', 'step-free'] },
  { id: 'maple-reading-room', name: 'Maple Reading Room', neighborhood: 'Old Market', category: 'quiet', categoryLabel: 'A soft landing', durationMinutes: 25, price: 0, energy: 'gentle', stepFree: true, description: 'A sunlit room for ten unhurried pages and a clean finish.', color: 'lavender', tags: ['books', 'quiet', 'indoors'] },
  { id: 'pigeon-pine-bakery', name: 'Pigeon & Pine Bakery', neighborhood: 'North Quay', category: 'coffee', categoryLabel: 'A good start', durationMinutes: 25, price: 9, energy: 'gentle', stepFree: true, description: 'A tiny bakery with window seats and something still warm.', color: 'butter', tags: ['warm', 'treat', 'window seat'] },
  { id: 'tiny-print-studio', name: 'Tiny Print Studio', neighborhood: 'Old Market', category: 'maker', categoryLabel: 'Make something', durationMinutes: 35, price: 12, energy: 'balanced', stepFree: true, description: 'Choose an ink, pull a small print, leave with a pocket-sized artifact.', color: 'ink', tags: ['hands-on', 'creative', 'indoors'] },
  { id: 'brass-arcade', name: 'Brass Arcade', neighborhood: 'South Steps', category: 'wander', categoryLabel: 'A little outside', durationMinutes: 25, price: 0, energy: 'bright', stepFree: false, description: 'A bright arcade of record shops, plants, and one long staircase.', color: 'rose', tags: ['shops', 'bright', 'stairs'] },
  { id: 'loom-lab', name: 'Loom Lab', neighborhood: 'East Canal', category: 'maker', categoryLabel: 'Make something', durationMinutes: 40, price: 18, energy: 'bright', stepFree: true, description: 'A drop-in weaving table for making a small stripe of your own.', color: 'blue', tags: ['hands-on', 'creative', 'drop-in'] },
];

/** @param {string} id @returns {Stop|undefined} */
export function getStop(id) { return STOPS.find((stop) => stop.id === id); }
