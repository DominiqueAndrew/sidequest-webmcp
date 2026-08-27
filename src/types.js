/** @typedef {'gentle'|'balanced'|'bright'} Energy */
/** @typedef {'coffee'|'wander'|'maker'|'quiet'} StopCategory */
/** @typedef {'human'|'agent'|'system'} ActivitySource */

/**
 * @typedef {Object} Brief
 * @property {string} start
 * @property {number} durationMinutes
 * @property {Energy} energy
 * @property {number} budget
 * @property {boolean} stepFree
 */

/**
 * @typedef {Object} Stop
 * @property {string} id
 * @property {string} name
 * @property {string} neighborhood
 * @property {StopCategory} category
 * @property {string} categoryLabel
 * @property {number} durationMinutes
 * @property {number} price
 * @property {Energy} energy
 * @property {boolean} stepFree
 * @property {string} description
 * @property {string} color
 * @property {string[]} tags
 */

/** @typedef {{stopId:string,startMinute:number,endMinute:number,note:string}} PlannedStop */
/** @typedef {{id:string,title:string,brief:Brief,stops:PlannedStop[],totalMinutes:number,totalCost:number,status:'draft'|'saved'}} Plan */
/** @typedef {{id:string,source:ActivitySource,label:string,detail:string,timestamp:number}} Activity */

export {};
