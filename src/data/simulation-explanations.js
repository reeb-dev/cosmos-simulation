/**
 * Pedagogical texts: mode explanations and theory summaries (from locale bundles).
 */
import { getBundle } from '../i18n/i18n.js';

export function getModeExplanations() {
  return getBundle('explainer.modes') ?? {};
}

export function getModeExplanation(modeId) {
  return getModeExplanations()[modeId] ?? null;
}

export function getTheorySummaries() {
  return getBundle('explainer.theories') ?? {};
}

export function getTheorySummary(theoryId) {
  const summaries = getTheorySummaries();
  return summaries[theoryId] ?? getBundle(`theories.${theoryId}.description`);
}

/** @deprecated use getModeExplanations() */
export const MODE_EXPLANATIONS = new Proxy(
  {},
  { get: (_, key) => getModeExplanations()[key] }
);

/** @deprecated use getTheorySummaries() */
export const THEORY_SUMMARIES = new Proxy(
  {},
  { get: (_, key) => getTheorySummaries()[key] }
);
