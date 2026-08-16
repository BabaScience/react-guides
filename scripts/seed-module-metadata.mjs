/**
 * One-shot: write `difficulty` and `prerequisites` into content/modules/*.yml.
 *
 * Kept in the repo as the record of how the initial graph was assigned. The
 * files are the source of truth from here on — edit those, not this.
 *
 * Prerequisites express what a module actually assumes, not the order the
 * chapters happen to sit in. Styling does not need component patterns; routing
 * does not need styling. A flat chain would be easy and would be a lie.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** id -> [difficulty, prerequisites] */
const META = {
  // --- React
  '01-fundamentals': ['beginner', []],
  '02-hooks': ['beginner', ['01-fundamentals']],
  '03-component-patterns': ['intermediate', ['02-hooks']],
  '04-styling': ['beginner', ['01-fundamentals']],
  '05-routing': ['intermediate', ['02-hooks']],
  '06-state-management': ['intermediate', ['02-hooks', '03-component-patterns']],
  '07-data-fetching': ['intermediate', ['02-hooks']],
  '08-forms': ['intermediate', ['02-hooks']],
  '09-performance': ['advanced', ['02-hooks', '03-component-patterns']],
  '10-testing': ['advanced', ['02-hooks']],

  // --- JavaScript
  'js-01-prerequisites': ['beginner', []],
  'js-02-language-basics': ['beginner', ['js-01-prerequisites']],
  'js-03-operators': ['beginner', ['js-02-language-basics']],
  'js-04-control-flow': ['beginner', ['js-03-operators']],
  'js-05-functions': ['beginner', ['js-04-control-flow']],
  'js-06-objects-prototypes': ['intermediate', ['js-05-functions']],
  'js-07-arrays': ['beginner', ['js-05-functions']],
  'js-08-strings-numbers-dates': ['beginner', ['js-02-language-basics']],
  'js-09-scope-closures': ['intermediate', ['js-05-functions']],
  'js-10-this-keyword': ['intermediate', ['js-06-objects-prototypes']],
  'js-11-classes': ['intermediate', ['js-06-objects-prototypes', 'js-10-this-keyword']],
  'js-12-modules': ['intermediate', ['js-05-functions']],
  'js-13-async': ['intermediate', ['js-09-scope-closures']],
  'js-14-error-handling': ['intermediate', ['js-13-async']],
  'js-15-event-loop': ['advanced', ['js-13-async']],
  'js-16-browser-apis': ['intermediate', ['js-13-async']],
  'js-17-nodejs': ['intermediate', ['js-12-modules', 'js-13-async']],
  'js-18-modern-es': ['intermediate', ['js-12-modules']],
  'js-19-typescript': ['intermediate', ['js-11-classes', 'js-12-modules']],
  'js-20-tooling': ['intermediate', ['js-12-modules']],
  'js-21-testing': ['intermediate', ['js-12-modules']],
  'js-22-performance': ['advanced', ['js-15-event-loop']],
  'js-23-security': ['advanced', ['js-16-browser-apis']],
  'js-24-patterns': ['advanced', ['js-11-classes', 'js-12-modules']],

  // --- React Native. rn-02 depends on the React track on purpose: its
  // fundamentals assume components, props and JSX already make sense.
  'rn-01-prerequisites': ['beginner', []],
  'rn-02-fundamentals': ['beginner', ['rn-01-prerequisites', '01-fundamentals']],
  'rn-03-environment-setup': ['beginner', ['rn-01-prerequisites']],
  'rn-04-core-components': ['beginner', ['rn-02-fundamentals', 'rn-03-environment-setup']],
  'rn-05-styling-layout': ['beginner', ['rn-04-core-components']],
  'rn-06-navigation': ['intermediate', ['rn-04-core-components']],
  'rn-07-state-management': ['intermediate', ['rn-04-core-components']],
  'rn-08-forms-input': ['intermediate', ['rn-04-core-components']],
  'rn-09-networking-data': ['intermediate', ['rn-07-state-management']],
  'rn-10-native-device-apis': ['intermediate', ['rn-04-core-components']],
  'rn-11-storage-persistence': ['intermediate', ['rn-09-networking-data']],
  'rn-12-animations-gestures': ['advanced', ['rn-05-styling-layout']],
  'rn-13-performance': ['advanced', ['rn-12-animations-gestures']],
  'rn-14-native-modules': ['advanced', ['rn-10-native-device-apis']],
  'rn-15-auth-security': ['advanced', ['rn-09-networking-data', 'rn-11-storage-persistence']],
  'rn-16-testing': ['intermediate', ['rn-04-core-components']],
  'rn-17-push-background': ['advanced', ['rn-10-native-device-apis']],
  'rn-18-build-deploy': ['intermediate', ['rn-03-environment-setup']],
  'rn-19-ota-updates': ['advanced', ['rn-18-build-deploy']],
  'rn-20-monitoring-production': ['advanced', ['rn-18-build-deploy']],
  'rn-21-advanced-topics': ['advanced', ['rn-13-performance', 'rn-14-native-modules']],
};

let written = 0;
for (const [id, [difficulty, prerequisites]] of Object.entries(META)) {
  const file = path.join(ROOT, 'content', 'modules', `${id}.yml`);
  const src = fs.readFileSync(file, 'utf8');
  if (/^difficulty:/m.test(src)) {
    console.log(`skip ${id} (already has difficulty)`);
    continue;
  }

  const block =
    `difficulty: ${difficulty}\n` +
    (prerequisites.length
      ? `prerequisites:\n${prerequisites.map((p) => `  - ${p}`).join('\n')}\n`
      : '');

  // Insert straight after `status:`, keeping the header fields together.
  const out = src.replace(/^(status:.*\n)/m, `$1${block}`);
  if (out === src) throw new Error(`${id}: no status: line to anchor on`);
  fs.writeFileSync(file, out);
  written++;
}
console.log(`wrote metadata into ${written} module file(s)`);
