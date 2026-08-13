/**
 * The module catalogue, loaded from the generated manifest.
 *
 * This file used to hold ~2,000 lines of hand-written metadata across three
 * files, maintained in parallel with the markdown chapters and the locale
 * files. Nothing checked that the three agreed, and they didn't: 39 authored
 * sections were unreachable, seven lessons were dead ends in French and
 * Italian, and hint counts had drifted.
 *
 * The source of truth is now `content/modules/*.yml`, compiled by
 * `scripts/build-manifest.mjs` into `manifest.json`. The compiler fails the
 * build unless every guide heading is either claimed by a lesson step or
 * explicitly skipped — so a written-but-unreachable section can no longer
 * exist, rather than merely being unlikely.
 *
 * To change the catalogue, edit the YAML and run `npm run manifest`.
 * Display text lives in `src/i18n/locales/*.json`, keyed by the ids here.
 */

import type { Module, Track } from '@/types/exercise';
import manifest from './manifest.json';

export const modules: Module[] = manifest.modules as Module[];

export function getModule(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

/**
 * Module numbers restart per track, so `number` alone is ambiguous — React 1,
 * React Native 1 and JavaScript 1 all exist. Always pass the track.
 */
export function getModuleByNumber(num: number, track: Track): Module | undefined {
  return modules.find((m) => m.number === num && m.track === track);
}

export function getModulesByTrack(track: Track): Module[] {
  return modules.filter((m) => m.track === track);
}
