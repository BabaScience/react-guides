import { Button, Badge, Card } from '@/components/ui';

/**
 * Living style guide — renders every token and primitive from DESIGN_SYSTEM.md.
 * When the design system changes, update DESIGN_SYSTEM.md, the ui/ primitives,
 * and this page together in the same PR.
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 pb-2 border-b border-gray-200 dark:border-gray-800">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3 uppercase tracking-wide">
      {children}
    </h3>
  );
}

function Swatch({ cls, label, hex }: { cls: string; label: string; hex?: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className={`w-16 h-10 rounded-lg border border-gray-200 dark:border-gray-800 ${cls}`} />
      <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{label}</span>
      {hex && <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{hex}</span>}
    </div>
  );
}

// Full literal class names — Tailwind JIT cannot see dynamically built classes.
// "Paper & ink": primary = indigo, gray = stone (see tailwind.config.ts).
const primarySwatches = [
  { cls: 'bg-primary-50', label: 'primary-50', hex: '#eef2ff' },
  { cls: 'bg-primary-100', label: 'primary-100', hex: '#e0e7ff' },
  { cls: 'bg-primary-300', label: 'primary-300', hex: '#a5b4fc' },
  { cls: 'bg-primary-400', label: 'primary-400', hex: '#818cf8' },
  { cls: 'bg-primary-500', label: 'primary-500', hex: '#6366f1' },
  { cls: 'bg-primary-600', label: 'primary-600', hex: '#4f46e5' },
  { cls: 'bg-primary-700', label: 'primary-700', hex: '#4338ca' },
];

const grayRoles = [
  { label: 'app bg', cls: 'bg-gray-50 dark:bg-gray-950' },
  { label: 'panel', cls: 'bg-gray-50 dark:bg-gray-900' },
  { label: 'surface', cls: 'bg-white dark:bg-gray-900/50' },
  { label: 'hover', cls: 'bg-gray-100 dark:bg-gray-800' },
  { label: 'border', cls: 'bg-gray-200 dark:bg-gray-800' },
  { label: 'strong border', cls: 'bg-gray-300 dark:bg-gray-700' },
];

export function StyleGuide() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-3xl text-gray-900 dark:text-white mb-2">Style guide — Paper &amp; ink</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
        Living reference for <code className="bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded text-sm font-mono">DESIGN_SYSTEM.md</code> (v2,
        warm editorial light). Light is the primary theme — design here first, then verify dark
        ("ink") mode with the header toggle.
      </p>

      <Section title="1. Colors">
        <SubHeading>Primary (interactive / brand)</SubHeading>
        <div className="flex flex-wrap gap-3">
          {primarySwatches.map((s) => (
            <Swatch key={s.label} cls={s.cls} label={s.label} hex={s.hex} />
          ))}
        </div>

        <SubHeading>Neutral roles</SubHeading>
        <div className="flex flex-wrap gap-3">
          {grayRoles.map((g) => (
            <Swatch key={g.label} cls={g.cls} label={g.label} />
          ))}
        </div>

        <SubHeading>Semantic surfaces</SubHeading>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Success / complete</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">emerald — passed tests, finished steps</p>
          </div>
          <div className="border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Attention / current</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">amber — current step, not passing yet</p>
          </div>
          <div className="border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Error</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">red — runtime/sandbox errors</p>
          </div>
        </div>

        <SubHeading>Dark opacity ladder (the only allowed steps)</SubHeading>
        <div className="flex flex-wrap gap-3">
          <Swatch cls="bg-primary-600/20" label="/20 tint" />
          <Swatch cls="bg-gray-900/30 dark:bg-gray-900/30" label="/30 wash" />
          <Swatch cls="bg-gray-900/50 dark:bg-gray-900/50" label="/50 surface" />
          <Swatch cls="bg-gray-900/80 dark:bg-gray-900/80" label="/80 solid-ish" />
        </div>
      </Section>

      <Section title="2. Typography">
        <div className="space-y-3">
          <p className="font-display text-3xl text-gray-900 dark:text-white">Page title — font-display text-3xl (serif)</p>
          <p className="font-display text-2xl text-gray-900 dark:text-white">Section title — font-display text-2xl (serif)</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">Sub-section — text-xl semibold</p>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Card title — text-lg semibold</p>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            Body text — text-sm leading-relaxed. Lesson paragraphs and standard UI copy. Inline
            code looks like{' '}
            <code className="bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded text-sm font-mono">useState</code>{' '}
            and links look{' '}
            <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline">like this</a>.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Metadata — text-xs muted</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Chip label — text-[10px], the smallest allowed size</p>
        </div>
      </Section>

      <Section title="3. Buttons">
        <SubHeading>Variants (size lg)</SubHeading>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="lg">Primary (ink)</Button>
          <Button variant="accent" size="lg">Accent</Button>
          <Button variant="success" size="lg">Success</Button>
          <Button variant="secondary" size="lg">Secondary</Button>
          <Button variant="ghost" size="lg">Ghost</Button>
          <Button variant="primary" size="lg" disabled>Disabled</Button>
        </div>
        <SubHeading>Sizes (variant primary)</SubHeading>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Tab to any button to see the required focus ring.
        </p>
      </Section>

      <Section title="4. Badges & track chips">
        <SubHeading>Status badges</SubHeading>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="neutral">Soon</Badge>
          <Badge tone="info">Exercise</Badge>
          <Badge tone="warning">Lesson</Badge>
          <Badge tone="success">Completed</Badge>
        </div>
        <SubHeading>Track chips (the only per-track color)</SubHeading>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="js">JavaScript</Badge>
          <Badge tone="react">React</Badge>
          <Badge tone="native">React Native</Badge>
        </div>
      </Section>

      <Section title="5. Cards">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card tone="default">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Default</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Static content grouping.</p>
          </Card>
          <Card tone="interactive">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Interactive</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Hover me — border and background shift.</p>
          </Card>
          <Card tone="success">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Success</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed module state.</p>
          </Card>
          <Card tone="muted">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Muted</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Coming-soon / disabled state.</p>
          </Card>
        </div>
      </Section>

      <Section title="6. Progress & Timeline">
        <SubHeading>Progress bars</SubHeading>
        <div className="space-y-3 max-w-sm">
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: '45%' }} />
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: '100%' }} />
          </div>
        </div>

        <SubHeading>Timeline dots</SubHeading>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-7 rounded-full border-2 bg-emerald-600 border-emerald-600 text-white flex items-center justify-center text-xs">✓</div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">complete</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-7 rounded-full border-2 bg-amber-600/20 border-amber-500 text-amber-400 flex items-center justify-center text-xs">2</div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">current lesson</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-7 rounded-full border-2 bg-primary-600/20 border-primary-500 text-primary-400 flex items-center justify-center text-xs">3</div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">current exercise</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-7 rounded-full border-2 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 flex items-center justify-center text-xs">4</div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">upcoming</span>
          </div>
        </div>
      </Section>

      <Section title="7. Shape & Elevation">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
            <span className="text-[10px] font-mono text-gray-500">rounded</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
            <span className="text-[10px] font-mono text-gray-500">rounded-md</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
            <span className="text-[10px] font-mono text-gray-500">rounded-lg ★</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
            <span className="text-[10px] font-mono text-gray-500">rounded-xl (cards)</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
            <span className="text-[10px] font-mono text-gray-500">rounded-full</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg" />
            <span className="text-[10px] font-mono text-gray-500">shadow-lg (menus only)</span>
          </div>
        </div>
      </Section>
    </div>
  );
}
