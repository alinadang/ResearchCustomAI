/**
 * ActivityContext — kept as a compatibility shim.
 *
 * All state has been migrated to AppContext. This file simply re-exports
 * the parts of AppContext that used to live here so any external code
 * referencing the old module continues to work without changes.
 */
export { AppProvider as ActivityProvider, useActivity } from './AppContext';
