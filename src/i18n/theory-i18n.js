import { t, getBundle } from './i18n.js';
import { HORIZON_THEORIES } from '../simulation/horizon-theories.js';

export function theoryPrefix(theory) {
  if (theory.physicsBreak) return `${t('badges.physicsBreak')} `;
  if (theory.fiction) return `${t('badges.fiction')} `;
  if (theory.original || theory.speculative) return `${t('badges.original')} `;
  return '';
}

export function getTheoryField(id, field) {
  const fromLocale = getBundle(`theories.${id}.${field}`);
  if (fromLocale != null && fromLocale !== '') return fromLocale;
  return HORIZON_THEORIES[id]?.[field] ?? '';
}

export function getTheoryName(id) {
  return `${theoryPrefix(HORIZON_THEORIES[id])}${getTheoryField(id, 'name')}`;
}

export function getTheory(id) {
  const base = HORIZON_THEORIES[id];
  if (!base) return null;
  return {
    ...base,
    name: getTheoryField(id, 'name'),
    short: getTheoryField(id, 'short'),
    description: getTheoryField(id, 'description'),
    status: getTheoryField(id, 'status'),
    horizonVisual: {
      ...base.horizonVisual,
      crossingDescription:
        getTheoryField(id, 'crossingDescription') || base.horizonVisual?.crossingDescription,
    },
    physicsBasis: getTheoryField(id, 'physicsBasis') || base.physicsBasis,
  };
}
