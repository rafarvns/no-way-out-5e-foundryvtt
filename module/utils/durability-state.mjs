/**
 * No Way Out! - 5e
 * Durability State Mapper
 *
 * Maps a numeric durability value (0–10) to a human-readable state description.
 * Used to display item condition to players without revealing exact numbers.
 */

import { NWO } from "../config.mjs";

/**
 * Durability state thresholds.
 * Each entry defines a range ceiling and the i18n key for the description.
 * The first matching threshold (from top) is used.
 * @readonly
 * @type {{ max: number, i18nKey: string }[]}
 */
const DURABILITY_STATES = Object.freeze([
  { max: 0,    i18nKey: `${NWO.I18N}.DurabilityState.Destroyed` },
  { max: 2,    i18nKey: `${NWO.I18N}.DurabilityState.Critical` },
  { max: 4,    i18nKey: `${NWO.I18N}.DurabilityState.HeavilyDamaged` },
  { max: 6,    i18nKey: `${NWO.I18N}.DurabilityState.Damaged` },
  { max: 8,    i18nKey: `${NWO.I18N}.DurabilityState.Worn` },
  { max: 9.5,  i18nKey: `${NWO.I18N}.DurabilityState.LightScratches` },
  { max: 10,   i18nKey: `${NWO.I18N}.DurabilityState.Pristine` },
]);

/**
 * Get the durability state description for a given durability value.
 * @param {number} durability  The durability value (0–10).
 * @returns {string} Localized description of the item's condition.
 */
export function getDurabilityState(durability) {
  const value = Math.clamp(durability ?? NWO.DEFAULTS.DURABILITY, 0, 10);
  const state = DURABILITY_STATES.find(s => value <= s.max);
  return game.i18n.localize(state?.i18nKey ?? `${NWO.I18N}.DurabilityState.Pristine`);
}

/**
 * Get the CSS color class for a durability value.
 * Used to visually indicate the item's condition.
 * @param {number} durability  The durability value (0–10).
 * @returns {string} CSS class name for the durability color.
 */
export function getDurabilityColorClass(durability) {
  const value = Math.clamp(durability ?? NWO.DEFAULTS.DURABILITY, 0, 10);
  if ( value <= 0 ) return "nwo-durability-destroyed";
  if ( value <= 2 ) return "nwo-durability-critical";
  if ( value <= 4 ) return "nwo-durability-heavy";
  if ( value <= 6 ) return "nwo-durability-damaged";
  if ( value <= 8 ) return "nwo-durability-worn";
  if ( value <= 9.5 ) return "nwo-durability-light";
  return "nwo-durability-pristine";
}