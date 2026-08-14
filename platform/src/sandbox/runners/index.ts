import type { Module } from '@/types/exercise';
import { failureResult, type ExerciseRunner, type RunnerId } from '@/sandbox/runner-types';
import { reactBrowserRunner } from './react-browser';

/**
 * Runner registry.
 *
 * A module declares its runner in `content/modules/<id>.yml`; tracks fall back
 * to a sensible default. Adding a track is then a content change plus one
 * runner, rather than a rewrite of the exercise view.
 *
 * Default timeout is generous: `user.type` walks a string character by
 * character with real events, so a legitimate form test can take a second or
 * two on a slow machine.
 *
 * Raised from 15s when grading moved into the isolated frame. The frame itself
 * is cheap — ~0.5s to boot warm, ~5ms per round trip — but it runs React's
 * *development* build, which is what gives it a working `act()` and is several
 * times slower per simulated keystroke. Module 01 exercise 7 types ~50
 * characters across its cases and legitimately needs more than 15s now.
 *
 * This is a backstop, not the primary defence: a runaway loop is caught by the
 * loop guard in ~2s, and this only has to cover what the guard cannot see — a
 * stray `setInterval`, a promise that never settles.
 */
export const DEFAULT_TIMEOUT_MS = 45_000;

/**
 * Placeholder for runners that are designed but not built. It reports the
 * situation to the learner instead of throwing an opaque error, so a track can
 * ship its lessons before its grader exists.
 */
function plannedRunner(id: RunnerId, needs: string): ExerciseRunner {
  return {
    id,
    async run() {
      return failureResult(
        'Runner not available yet',
        `Exercises for this track need the "${id}" runner (${needs}), which isn't wired up yet. ` +
          `The lessons work — only grading is unavailable.`
      );
    },
  };
}

const RUNNERS: Record<RunnerId, ExerciseRunner> = {
  'react-browser': reactBrowserRunner,
  // Each of these needs its own isolated execution context, which is also what
  // finally gives this platform a killable sandbox — see PLAN.md P2.6.
  'node-webcontainer': plannedRunner('node-webcontainer', 'a Node runtime in the browser'),
  'python-pyodide': plannedRunner('python-pyodide', 'CPython compiled to WebAssembly'),
  'map-interactive': plannedRunner('map-interactive', 'an interactive map component'),
};

/** Tracks whose exercises are JavaScript-family code graded in this page. */
const TRACK_DEFAULTS: Record<string, RunnerId> = {
  react: 'react-browser',
  'react-native': 'react-browser',
  javascript: 'react-browser',
};

export function getRunner(module: Module): ExerciseRunner {
  const id = module.runner ?? TRACK_DEFAULTS[module.track] ?? 'react-browser';
  return RUNNERS[id] ?? RUNNERS['react-browser'];
}

export const KNOWN_RUNNER_IDS = Object.keys(RUNNERS) as RunnerId[];
