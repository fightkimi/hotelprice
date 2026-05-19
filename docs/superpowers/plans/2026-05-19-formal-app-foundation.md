# Formal App Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first formal, tokenized, testable frontend app foundation for the hotel pricing capture product.

**Architecture:** Create a contained `app/` React + TypeScript + Vite workspace. Implement F-006 tokens as CSS variables, typed fixture contracts, primitive layout/chart components, five fixture-backed screens, and automated contract/screenshot gates. Keep production app foundation separate from `prototypes/client-demo/`; the prototype remains reference material only.

**Tech Stack:** React, TypeScript, Vite, CSS variables, native SVG charts, Vitest, Testing Library, Playwright, lucide-react.

---

## Scope Check

This is the first formal frontend foundation. It does not implement live collection, persistence, authentication, deployment, or automatic pricing. It uses fixture/demo data only and must preserve source, capture time, room type, platform, tax/fee, occupancy, meal-plan, sample-size, and human-review context.

Repository readiness is a hard gate. Do not edit `app/` product files until `git status --short` succeeds on a non-main branch.

## Planned File Changes

Create:

- `app/package.json`
- `app/index.html`
- `app/vite.config.ts`
- `app/tsconfig.json`
- `app/tsconfig.node.json`
- `app/playwright.config.ts`
- `app/src/main.tsx`
- `app/src/App.tsx`
- `app/tests/setup.ts`
- `app/src/types/contracts.ts`
- `app/src/data/demoDataset.ts`
- `app/src/styles/tokens.css`
- `app/src/styles/base.css`
- `app/src/styles/layout.css`
- `app/src/components/layout/AppShell.tsx`
- `app/src/components/layout/ContextRibbon.tsx`
- `app/src/components/primitives/SignalPanel.tsx`
- `app/src/components/primitives/EvidenceDrawer.tsx`
- `app/src/components/charts/TrendChart.tsx`
- `app/src/components/charts/CalendarHeatmap.tsx`
- `app/src/components/charts/PlatformGapBars.tsx`
- `app/src/components/charts/EventTimeline.tsx`
- `app/src/screens/OverviewScreen.tsx`
- `app/src/screens/CalendarScreen.tsx`
- `app/src/screens/MarketComparisonScreen.tsx`
- `app/src/screens/AlertReviewScreen.tsx`
- `app/src/screens/SetupDataScopeScreen.tsx`
- `app/tests/contract/tokens.test.ts`
- `app/tests/contract/contrast.test.ts`
- `app/tests/contract/demoDataset.test.ts`
- `app/tests/components/contextRibbon.test.tsx`
- `app/tests/components/evidenceDrawer.test.tsx`
- `app/tests/components/charts.test.tsx`
- `app/tests/e2e/app-foundation.spec.ts`
- `docs/test-reports/f-007-app-foundation/` screenshot output directory

Modify:

- `features.json`
- `progress.json`
- `backlog.json`
- `.auto-memory/project-status.md`

Do not modify:

- `prototypes/client-demo/*`
- existing prototype tests, except by a separate approved feature
- backend, migrations, deployment, or runtime collection code

## Task 0: Repository Readiness Gate

**Files:**
- No product files.

- [ ] **Step 1: Confirm Git readiness**

Run:

```bash
git status --short
git branch --show-current
```

Expected: `git status --short` exits 0 and branch is not `main` or `master`.

- [ ] **Step 2: Stop if repository is missing**

If the command returns `fatal: not a git repository`, stop product work and resolve one of these owner-approved paths:

```bash
git init
git switch -c feature/f-007-formal-app-foundation
```

or attach this folder to the intended remote repository and then run:

```bash
git switch -c feature/f-007-formal-app-foundation
```

Expected: branch is `feature/f-007-formal-app-foundation`.

- [ ] **Step 3: Record readiness evidence**

Add the successful `git status --short` and branch output to the Generator handoff note before coding begins.

## Task 1: Scaffold App Workspace And Test Harness

**Files:**
- Create: `app/package.json`
- Create: `app/index.html`
- Create: `app/vite.config.ts`
- Create: `app/tsconfig.json`
- Create: `app/tsconfig.node.json`
- Create: `app/playwright.config.ts`
- Create: `app/src/main.tsx`
- Create: `app/src/App.tsx`
- Create: `app/tests/setup.ts`

- [ ] **Step 1: Create package manifest**

Create `app/package.json`:

```json
{
  "name": "hotel-pricing-capture-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "screenshots": "playwright test tests/e2e/app-foundation.spec.ts",
    "contract": "vitest run tests/contract tests/components && playwright test tests/e2e/app-foundation.spec.ts",
    "verify": "npm run build && npm run test && npm run screenshots"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
cd app
npm install
npx playwright install chromium
```

Expected: `package-lock.json` is created in `app/` and Chromium is available for Playwright.

- [ ] **Step 3: Create Vite and TypeScript config**

Create `app/vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  }
});
```

Create `app/tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Create `app/tsconfig.json` with strict TypeScript:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `app/tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "playwright.config.ts"]
}
```

- [ ] **Step 4: Create Playwright config**

Create `app/playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev -- --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
```

- [ ] **Step 5: Create minimal app entry**

Create `app/index.html`, `app/src/main.tsx`, and `app/src/App.tsx` with a temporary product shell:

```tsx
// app/src/App.tsx
export function App() {
  return <main>Hotel Pricing Capture</main>;
}
```

- [ ] **Step 6: Verify scaffold**

Run:

```bash
cd app
npm run build
```

Expected: build succeeds with the temporary app.

- [ ] **Step 7: Commit scaffold**

Run:

```bash
git add app/package.json app/package-lock.json app/index.html app/vite.config.ts app/tsconfig.json app/tsconfig.node.json app/playwright.config.ts app/src/main.tsx app/src/App.tsx
git commit -m "feat: scaffold formal app foundation"
```

## Task 2: Token Layer And Contrast Gates

**Files:**
- Create: `app/src/styles/tokens.css`
- Create: `app/src/styles/base.css`
- Create: `app/tests/contract/tokens.test.ts`
- Create: `app/tests/contract/contrast.test.ts`
- Modify: `app/src/main.tsx`

- [ ] **Step 1: Write failing token exactness test**

Create `app/tests/contract/tokens.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

const requiredTokens: Record<string, string> = {
  '--color-bg': '#EEF3F2',
  '--color-surface': '#FFFFFF',
  '--color-surface-raised': '#F8FAF9',
  '--color-ink': '#17211D',
  '--color-muted': '#66736E',
  '--color-line': '#D9E2DF',
  '--color-teal': '#087E78',
  '--color-blue': '#2D7FA6',
  '--color-amber': '#B8751A',
  '--color-red': '#B54848',
  '--color-green': '#2F7D4F',
  '--color-violet': '#6857A8',
  '--color-focus': '#0A6CFF',
  '--color-disabled-bg': '#EDF1EF',
  '--color-disabled-text': '#8A9691'
};

describe('F-006 token contract', () => {
  it('defines exact color token values', () => {
    for (const [name, value] of Object.entries(requiredTokens)) {
      expect(css).toContain(`${name}: ${value};`);
    }
  });

  it('keeps typography and layout rules measurable', () => {
    expect(css).toContain('--font-title-size: 28px;');
    expect(css).toContain('--font-section-size: 18px;');
    expect(css).toContain('--space-24: 24px;');
    expect(css).toContain('--radius-panel: 8px;');
    expect(css).toContain('letter-spacing: 0;');
  });
});
```

- [ ] **Step 2: Run token test and verify RED**

Run:

```bash
cd app
npm test -- tests/contract/tokens.test.ts
```

Expected: FAIL because `src/styles/tokens.css` does not exist.

- [ ] **Step 3: Implement token CSS**

Create `app/src/styles/tokens.css` with all F-006 tokens:

```css
:root {
  --color-bg: #EEF3F2;
  --color-surface: #FFFFFF;
  --color-surface-raised: #F8FAF9;
  --color-ink: #17211D;
  --color-muted: #66736E;
  --color-line: #D9E2DF;
  --color-teal: #087E78;
  --color-blue: #2D7FA6;
  --color-amber: #B8751A;
  --color-red: #B54848;
  --color-green: #2F7D4F;
  --color-violet: #6857A8;
  --color-focus: #0A6CFF;
  --color-disabled-bg: #EDF1EF;
  --color-disabled-text: #8A9691;
  --color-hover-surface: #F2F6F4;
  --color-active-surface: #E0F2EE;
  --color-selected-border: #087E78;
  --color-warning-bg: #FFF4E2;
  --color-risk-bg: #FDECEC;
  --color-success-bg: #E8F3EC;
  --color-info-bg: #EAF2F7;
  --font-title-size: 28px;
  --font-title-line: 34px;
  --font-section-size: 18px;
  --font-section-line: 24px;
  --font-body-size: 14px;
  --font-body-line: 20px;
  --font-meta-size: 12px;
  --font-meta-line: 17px;
  --font-kpi-size: 30px;
  --font-kpi-line: 34px;
  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-48: 48px;
  --radius-panel: 8px;
  --radius-pill: 999px;
  --border-width: 1px;
  --app-max-width: 1440px;
  --chart-min-height-desktop: 220px;
  --chart-min-height-mobile: 180px;
  color: var(--color-ink);
  background: var(--color-bg);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: var(--font-body-size);
  line-height: var(--font-body-line);
  letter-spacing: 0;
}
```

- [ ] **Step 4: Add base CSS and import tokens**

Create `app/src/styles/base.css` and import both CSS files from `app/src/main.tsx`:

```ts
import './styles/tokens.css';
import './styles/base.css';
```

- [ ] **Step 5: Verify token test GREEN**

Run:

```bash
cd app
npm test -- tests/contract/tokens.test.ts
```

Expected: PASS.

- [ ] **Step 6: Write contrast test**

Create `app/tests/contract/contrast.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

function token(name: string): string {
  const match = css.match(new RegExp(`${name}:\\\\s*(#[0-9A-Fa-f]{6});`));
  if (!match) throw new Error(`Missing token ${name}`);
  return match[1];
}

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = channel(Number.parseInt(clean.slice(0, 2), 16));
  const g = channel(Number.parseInt(clean.slice(2, 4), 16));
  const b = channel(Number.parseInt(clean.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  const high = Math.max(a, b);
  const low = Math.min(a, b);
  return (high + 0.05) / (low + 0.05);
}

const pairs = [
  ['ink on surface', token('--color-ink'), token('--color-surface'), 4.5],
  ['ink on app background', token('--color-ink'), token('--color-bg'), 4.5],
  ['muted on surface', token('--color-muted'), token('--color-surface'), 4.5],
  ['white on teal', '#FFFFFF', token('--color-teal'), 4.5],
  ['red on risk background', token('--color-red'), token('--color-risk-bg'), 4.5],
  ['white on red', '#FFFFFF', token('--color-red'), 4.5],
  ['white on green', '#FFFFFF', token('--color-green'), 4.5],
  ['white on violet', '#FFFFFF', token('--color-violet'), 4.5],
  ['focus on surface', token('--color-focus'), token('--color-surface'), 3.0],
  ['ink on warning background', token('--color-ink'), token('--color-warning-bg'), 4.5],
  ['ink on success background', token('--color-ink'), token('--color-success-bg'), 4.5],
  ['ink on info background', token('--color-ink'), token('--color-info-bg'), 4.5]
] as const;

describe('contrast contract', () => {
  it.each(pairs)('%s meets threshold', (_name, foreground, background, minimum) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(minimum);
  });
});
```

- [ ] **Step 7: Verify contrast test GREEN**

Run:

```bash
cd app
npm test -- tests/contract/contrast.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit token layer**

Run:

```bash
git add app/src/styles app/src/main.tsx app/tests/contract/tokens.test.ts app/tests/contract/contrast.test.ts
git commit -m "feat: add production ui tokens"
```

## Task 3: Typed Contracts And Fixture Dataset

**Files:**
- Create: `app/src/types/contracts.ts`
- Create: `app/src/data/demoDataset.ts`
- Create: `app/tests/contract/demoDataset.test.ts`

- [ ] **Step 1: Write failing fixture-boundary test**

Create `app/tests/contract/demoDataset.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { demoDataset } from '../../src/data/demoDataset';

describe('demo dataset boundaries', () => {
  it('marks data as fixture/demo and not live collection', () => {
    expect(demoDataset.sourceKind).toBe('fixture-demo');
    expect(demoDataset.liveCollectionEnabled).toBe(false);
    expect(demoDataset.demoDisclosure).toContain('演示');
  });

  it('keeps every rate point comparable with explicit basis', () => {
    for (const series of demoDataset.trend.series) {
      for (const point of series.points) {
        expect(point.rateKey.hotelId).toBeTruthy();
        expect(point.rateKey.roomType).toBeTruthy();
        expect(point.rateKey.platform).toBeTruthy();
        expect(point.currency).toBe('CNY');
        expect(point.taxFeeBasis).toBeTruthy();
        expect(point.occupancy).toBeGreaterThan(0);
        expect(point.mealPlan).toBeTruthy();
        expect(point.cancellationPolicy).toBeTruthy();
        expect(point.captureTime).toMatch(/^2026-/);
      }
    }
  });

  it('requires human review markers for pricing-sensitive signals', () => {
    for (const signal of demoDataset.signals) {
      expect(signal.humanReviewRequired).toBe(true);
      expect(signal.evidenceMarkers.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run dataset test and verify RED**

Run:

```bash
cd app
npm test -- tests/contract/demoDataset.test.ts
```

Expected: FAIL because `src/data/demoDataset.ts` does not exist.

- [ ] **Step 3: Create typed contracts**

Create `app/src/types/contracts.ts`:

```ts
export type SourceKind = 'fixture-demo';
export type Severity = 'normal' | 'warning' | 'risk' | 'softness';

export interface RateKey {
  hotelId: string;
  competitorGroupId: string;
  roomType: string;
  platform: string;
  stayDate: string;
  occupancy: number;
  mealPlan: string;
  taxFeeBasis: string;
  cancellationPolicy: string;
}

export interface PricePoint {
  date: string;
  value: number | null;
  currency: 'CNY';
  captureTime: string;
  rateKey: RateKey;
  occupancy: number;
  mealPlan: string;
  taxFeeBasis: string;
  cancellationPolicy: string;
}

export interface EvidenceMarker {
  label: string;
  source: string;
  captureTime: string;
  sampleSize: number;
  confidence: 'sample' | 'partial' | 'unavailable';
}

export interface Signal {
  id: string;
  title: string;
  primaryMetric: number;
  metricUnit: string;
  summary: string;
  severity: Severity;
  humanReviewRequired: boolean;
  evidenceMarkers: EvidenceMarker[];
}

export interface TrendSeries {
  id: string;
  label: string;
  colorToken: string;
  points: PricePoint[];
}

export interface EventMarker {
  date: string;
  label: string;
  type: 'holiday' | 'concert' | 'expo';
  lift: number;
  confidence: 'sample' | 'partial';
}

export interface HeatmapDay {
  date: string;
  label: string;
  intensity: number | null;
  coreAverage: number | null;
  ownerRate: number | null;
  eventLabel?: string;
  sampleSize: number;
  status: 'normal' | 'event-lift' | 'unavailable';
}

export interface PlatformGapRow {
  platform: string;
  ownerRate: number;
  coreAverage: number;
  gap: number;
  coverage: number;
}

export interface DemoDataset {
  sourceKind: SourceKind;
  liveCollectionEnabled: false;
  demoDisclosure: string;
  context: {
    property: string;
    roomType: string;
    platform: string;
    dateRange: string;
    competitorGroup: string;
    demandContext: string;
    captureTime: string;
  };
  trend: {
    series: TrendSeries[];
    events: EventMarker[];
    yAxisUnit: 'CNY';
    sampleSize: number;
  };
  heatmap: { days: HeatmapDay[] };
  platformGaps: { rows: PlatformGapRow[]; maxGap: number; unit: 'CNY' };
  signals: Signal[];
}
```

- [ ] **Step 4: Create fixture dataset**

Create `app/src/data/demoDataset.ts` using `DemoDataset` and include at least:

- one owner-rate series;
- one core-competitor-average series;
- one missing trend point with `value: null`;
- one holiday event marker;
- one unavailable heatmap day;
- three platform gap rows;
- three pricing-sensitive signals with evidence markers and `humanReviewRequired: true`.

- [ ] **Step 5: Verify dataset test GREEN**

Run:

```bash
cd app
npm test -- tests/contract/demoDataset.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit contracts and fixture data**

Run:

```bash
git add app/src/types app/src/data app/tests/contract/demoDataset.test.ts
git commit -m "feat: add typed demo data contracts"
```

## Task 4: App Shell And Context Ribbon

**Files:**
- Create: `app/src/styles/layout.css`
- Create: `app/src/components/layout/AppShell.tsx`
- Create: `app/src/components/layout/ContextRibbon.tsx`
- Create: `app/tests/components/contextRibbon.test.tsx`
- Modify: `app/src/App.tsx`

- [ ] **Step 1: Write failing context-ribbon test**

Create `app/tests/components/contextRibbon.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContextRibbon } from '../../src/components/layout/ContextRibbon';
import { demoDataset } from '../../src/data/demoDataset';

describe('ContextRibbon', () => {
  it('renders visible labels for property, room type, platform, date range, and capture time', () => {
    render(<ContextRibbon context={demoDataset.context} sourceKind={demoDataset.sourceKind} />);

    expect(screen.getByText('酒店')).toBeVisible();
    expect(screen.getByText('房型')).toBeVisible();
    expect(screen.getByText('平台')).toBeVisible();
    expect(screen.getByText('入住日期')).toBeVisible();
    expect(screen.getByText('采集时间')).toBeVisible();
    expect(screen.getByText(/演示数据/)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run context test and verify RED**

Run:

```bash
cd app
npm test -- tests/components/contextRibbon.test.tsx
```

Expected: FAIL because `ContextRibbon` does not exist.

- [ ] **Step 3: Implement layout primitives**

Create `AppShell` and `ContextRibbon` with:

- persistent context ribbon above analytical content;
- keyboard-focusable nav buttons;
- visible labels on all context controls;
- `data-state` attributes for loading, normal, and data-caveat-visible states;
- responsive CSS grid using F-006 spacing and layout tokens.

- [ ] **Step 4: Render Overview shell**

Update `app/src/App.tsx` to render `AppShell` with the fixture dataset context and a default overview main area.

- [ ] **Step 5: Verify shell tests GREEN**

Run:

```bash
cd app
npm test -- tests/components/contextRibbon.test.tsx
npm run build
```

Expected: both commands pass.

- [ ] **Step 6: Commit shell**

Run:

```bash
git add app/src/App.tsx app/src/styles/layout.css app/src/components/layout app/tests/components/contextRibbon.test.tsx
git commit -m "feat: add app shell and context ribbon"
```

## Task 5: Signal Panels And Evidence Drawer

**Files:**
- Create: `app/src/components/primitives/SignalPanel.tsx`
- Create: `app/src/components/primitives/EvidenceDrawer.tsx`
- Create: `app/tests/components/evidenceDrawer.test.tsx`

- [ ] **Step 1: Write failing evidence test**

Create `app/tests/components/evidenceDrawer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EvidenceDrawer } from '../../src/components/primitives/EvidenceDrawer';
import { demoDataset } from '../../src/data/demoDataset';

describe('EvidenceDrawer', () => {
  it('shows source, capture time, sample size, room type, platform, and human review marker', () => {
    const signal = demoDataset.signals[0];

    render(
      <EvidenceDrawer
        open
        heading="证据复核"
        rateKey={demoDataset.trend.series[0].points[0].rateKey}
        source={signal.evidenceMarkers[0].source}
        captureTime={signal.evidenceMarkers[0].captureTime}
        sampleSize={signal.evidenceMarkers[0].sampleSize}
        confidence={signal.evidenceMarkers[0].confidence}
        rationale={signal.summary}
        humanReviewRequired={signal.humanReviewRequired}
      />
    );

    expect(screen.getByText('需人工复核')).toBeVisible();
    expect(screen.getByText(/样本/)).toBeVisible();
    expect(screen.getByText(/房型/)).toBeVisible();
    expect(screen.getByText(/平台/)).toBeVisible();
    expect(screen.getByText(/采集时间/)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run evidence test and verify RED**

Run:

```bash
cd app
npm test -- tests/components/evidenceDrawer.test.tsx
```

Expected: FAIL because `EvidenceDrawer` does not exist.

- [ ] **Step 3: Implement SignalPanel**

Implement `SignalPanel` with:

- `normal`, `warning`, `risk`, `softness`, `loading`, and `no-comparable-sample` visual states;
- primary metric with tabular numerals;
- at least one visible evidence marker when not loading;
- no automatic-pricing action copy.

- [ ] **Step 4: Implement EvidenceDrawer**

Implement `EvidenceDrawer` with:

- closed, open, loading, unavailable-source, and no-comparable-sample states;
- `role="dialog"` when open;
- source, capture time, sample size, confidence, room type, platform, tax/fee basis;
- visible `需人工复核` when `humanReviewRequired` is true.

- [ ] **Step 5: Verify primitive tests GREEN**

Run:

```bash
cd app
npm test -- tests/components/evidenceDrawer.test.tsx
npm run build
```

Expected: both commands pass.

- [ ] **Step 6: Commit primitives**

Run:

```bash
git add app/src/components/primitives app/tests/components/evidenceDrawer.test.tsx
git commit -m "feat: add signal and evidence primitives"
```

## Task 6: Chart Primitives

**Files:**
- Create: `app/src/components/charts/TrendChart.tsx`
- Create: `app/src/components/charts/CalendarHeatmap.tsx`
- Create: `app/src/components/charts/PlatformGapBars.tsx`
- Create: `app/src/components/charts/EventTimeline.tsx`
- Create: `app/tests/components/charts.test.tsx`

- [ ] **Step 1: Write failing chart contract test**

Create `app/tests/components/charts.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CalendarHeatmap } from '../../src/components/charts/CalendarHeatmap';
import { PlatformGapBars } from '../../src/components/charts/PlatformGapBars';
import { TrendChart } from '../../src/components/charts/TrendChart';
import { demoDataset } from '../../src/data/demoDataset';

describe('chart primitives', () => {
  it('renders trend line segments and preserves missing data as gaps', () => {
    render(<TrendChart data={demoDataset.trend} />);

    expect(screen.getByRole('img', { name: /价格趋势/ })).toBeVisible();
    expect(screen.getAllByTestId('trend-segment').length).toBeGreaterThan(0);
    expect(screen.getByText(/数据缺口/)).toBeVisible();
  });

  it('renders unavailable heatmap days without treating them as zero', () => {
    render(<CalendarHeatmap days={demoDataset.heatmap.days} />);

    expect(screen.getByText(/暂无可比样本/)).toBeVisible();
    expect(screen.getByRole('grid')).toBeVisible();
  });

  it('renders platform gap rows with coverage and zero-gap marker', () => {
    render(<PlatformGapBars rows={demoDataset.platformGaps.rows} maxGap={demoDataset.platformGaps.maxGap} unit="CNY" />);

    expect(screen.getByText(/覆盖率/)).toBeVisible();
    expect(screen.getByText(/CNY 0/)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run chart test and verify RED**

Run:

```bash
cd app
npm test -- tests/components/charts.test.tsx
```

Expected: FAIL because chart components do not exist.

- [ ] **Step 3: Implement TrendChart**

Implement native SVG with:

- `role="img"` and label containing `价格趋势`;
- legend labels mapped to series colors;
- one `data-testid="trend-segment"` per drawn segment;
- null values rendered as gaps;
- event markers preserved on mobile.

- [ ] **Step 4: Implement CalendarHeatmap**

Implement a grid/list hybrid with:

- intensity clamped between 0 and 1;
- unavailable days rendered with neutral visual state and text `暂无可比样本`;
- selected day visible independent of intensity color;
- mobile layout with no horizontal overflow.

- [ ] **Step 5: Implement PlatformGapBars and EventTimeline**

Implement:

- proportional bar widths against `maxGap`;
- positive/negative semantic colors;
- visible coverage percentage;
- minimum marker for `CNY 0`;
- event confidence/sample marker.

- [ ] **Step 6: Verify chart tests GREEN**

Run:

```bash
cd app
npm test -- tests/components/charts.test.tsx
npm run build
```

Expected: both commands pass.

- [ ] **Step 7: Commit charts**

Run:

```bash
git add app/src/components/charts app/tests/components/charts.test.tsx
git commit -m "feat: add pricing chart primitives"
```

## Task 7: Five Formal Screens

**Files:**
- Create: `app/src/screens/OverviewScreen.tsx`
- Create: `app/src/screens/CalendarScreen.tsx`
- Create: `app/src/screens/MarketComparisonScreen.tsx`
- Create: `app/src/screens/AlertReviewScreen.tsx`
- Create: `app/src/screens/SetupDataScopeScreen.tsx`
- Modify: `app/src/App.tsx`

- [ ] **Step 1: Add screen-state router**

Update `App.tsx` so query params drive deterministic test states:

```ts
type ScreenId = 'overview' | 'calendar' | 'market' | 'alerts' | 'setup';
type AppState = 'normal' | 'loading' | 'empty' | 'detail-open' | 'drawer-open';
```

Read:

- `?screen=overview&state=normal`
- `?screen=overview&state=loading`
- `?screen=overview&state=empty`
- `?screen=calendar&state=detail-open`
- `?screen=market&state=normal`
- `?screen=alerts&state=drawer-open`
- `?screen=setup&state=normal`

- [ ] **Step 2: Implement OverviewScreen**

Use `SignalPanel`, `TrendChart`, and `EventTimeline`. Show fixture/demo marker, evidence markers, and human-review copy on pricing-sensitive signals.

- [ ] **Step 3: Implement CalendarScreen**

Use `CalendarHeatmap` plus a detail panel when state is `detail-open`.

- [ ] **Step 4: Implement MarketComparisonScreen**

Use `PlatformGapBars`, platform/source labels, coverage, and sample-size context.

- [ ] **Step 5: Implement AlertReviewScreen**

Render alert review list and open `EvidenceDrawer` when state is `drawer-open`.

- [ ] **Step 6: Implement SetupDataScopeScreen**

Render property profile, competitor group, source scope, fixture/demo caveat, and no live-collection claim.

- [ ] **Step 7: Verify screen build**

Run:

```bash
cd app
npm run build
npm test -- tests/contract/demoDataset.test.ts tests/components/contextRibbon.test.tsx tests/components/evidenceDrawer.test.tsx tests/components/charts.test.tsx
```

Expected: all commands pass.

- [ ] **Step 8: Commit screens**

Run:

```bash
git add app/src/App.tsx app/src/screens
git commit -m "feat: add formal pricing app screens"
```

## Task 8: E2E Visible-Copy, Overflow, And Screenshot Gates

**Files:**
- Create: `app/tests/e2e/app-foundation.spec.ts`
- Create: `docs/test-reports/f-007-app-foundation/`

- [ ] **Step 1: Write E2E gates**

Create `app/tests/e2e/app-foundation.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const screenshotDir = '../docs/test-reports/f-007-app-foundation';

const cases = [
  ['overview-normal--1440x900.png', '/?screen=overview&state=normal', { width: 1440, height: 900 }],
  ['overview-loading--1440x900.png', '/?screen=overview&state=loading', { width: 1440, height: 900 }],
  ['overview-empty--1440x900.png', '/?screen=overview&state=empty', { width: 1440, height: 900 }],
  ['overview-normal--390x844.png', '/?screen=overview&state=normal', { width: 390, height: 844 }],
  ['calendar-detail-open--1440x900.png', '/?screen=calendar&state=detail-open', { width: 1440, height: 900 }],
  ['calendar-detail-open--390x844.png', '/?screen=calendar&state=detail-open', { width: 390, height: 844 }],
  ['market-comparison-platform-bars--1440x900.png', '/?screen=market&state=normal', { width: 1440, height: 900 }],
  ['market-comparison-platform-bars--390x844.png', '/?screen=market&state=normal', { width: 390, height: 844 }],
  ['alert-review-drawer-open--1440x900.png', '/?screen=alerts&state=drawer-open', { width: 1440, height: 900 }],
  ['alert-review-drawer-open--390x844.png', '/?screen=alerts&state=drawer-open', { width: 390, height: 844 }],
  ['setup-data-scope--1280x800.png', '/?screen=setup&state=normal', { width: 1280, height: 800 }],
  ['setup-data-scope--768x1024.png', '/?screen=setup&state=normal', { width: 768, height: 1024 }]
] as const;

const forbiddenVisibleTerms = ['自动调价', '自动改价', '爬虫', '抓取', 'cookie', '验证码', 'token'];

for (const [filename, path, viewport] of cases) {
  test(`captures ${filename} without overflow or forbidden visible copy`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(path);
    await expect(page.getByText(/演示数据/)).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(8);

    const visibleText = await page.locator('body').innerText();
    for (const term of forbiddenVisibleTerms) {
      expect(visibleText).not.toContain(term);
    }

    await page.screenshot({ path: `${screenshotDir}/${filename}`, fullPage: true });
  });
}

test('analytical screens expose evidence and human review markers', async ({ page }) => {
  await page.goto('/?screen=alerts&state=drawer-open');
  await expect(page.getByText('需人工复核')).toBeVisible();
  await expect(page.getByText(/样本/)).toBeVisible();
  await expect(page.getByText(/采集时间/)).toBeVisible();
});
```

- [ ] **Step 2: Run E2E gates and verify failures identify missing states**

Run:

```bash
cd app
npm run screenshots
```

Expected on first run after screen implementation: any failure should point to missing visible marker, overflow, screenshot path, or state rendering. Fix only the failing contract.

- [ ] **Step 3: Verify E2E gates GREEN**

Run:

```bash
cd app
npm run screenshots
```

Expected: PASS and all 12 screenshot files exist under `docs/test-reports/f-007-app-foundation/`.

- [ ] **Step 4: Commit E2E gates and screenshots**

Run:

```bash
git add app/tests/e2e docs/test-reports/f-007-app-foundation
git commit -m "test: add app foundation visual gates"
```

## Task 9: Final Verification And Handoff

**Files:**
- Modify: `features.json`
- Modify: `progress.json`
- Modify: `backlog.json`
- Modify: `.auto-memory/project-status.md`

- [ ] **Step 1: Run full app verification**

Run:

```bash
cd app
npm run verify
```

Expected: build, Vitest suite, and Playwright screenshot gates pass.

- [ ] **Step 2: Run project workflow verification**

Run from project root:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
```

Expected: commands exit 0. `triad_doctor.py` should report a feature branch instead of the current repository warning.

- [ ] **Step 3: Scan F-007 app output for visible-copy gate scope**

Run:

```bash
cd app
npm run screenshots
```

Expected: Playwright visible DOM text scan passes. Technical design-token files and tests are not part of the visible-copy scan.

- [ ] **Step 4: Update Triad state**

After Generator implementation is complete and self-verified:

- set `F-007-formal-app-foundation` to `verifying`;
- keep executor as `generator`;
- attach the generated screenshot directory and app verification evidence;
- set the Evaluator backlog item for F-007 to `new`.

- [ ] **Step 5: Commit state updates**

Run:

```bash
git add features.json progress.json backlog.json .auto-memory/project-status.md
git commit -m "chore: hand off formal app foundation for evaluation"
```

## Generator Constraints

- Use `superpowers:test-driven-development` for every feature behavior.
- Verify each test fails before implementing the behavior it covers.
- Keep fixture data clearly labeled as demo data.
- Do not import, copy, or rename `prototypes/client-demo/styles.css` into the formal app.
- Do not introduce live collection, authentication, persistence, or automatic pricing.
- Keep every pricing-sensitive insight reviewable by a human.

## Evaluator Checklist

- Git status succeeds on a non-main branch.
- `app/src/styles/tokens.css` contains exact F-006 values.
- Contrast tests cover the F-007 matrix and pass.
- Rendered customer-facing text excludes the forbidden terms, including visible `token`.
- Technical design-token files and tests are not scanned as customer copy.
- Context ribbon labels are visible and keyboard focusable.
- Evidence drawer shows room type, platform/source, tax/fee basis, sample size, capture time, source, confidence, and `需人工复核`.
- Trend charts render line segments with valid data and gaps for null values.
- Calendar unavailable days do not display as zero.
- Platform gap bars show coverage and `CNY 0` marker.
- All 12 screenshots exist with exact names and no horizontal overflow over 8px.
- Product output contains no live scraping, credential, cookie/session, CAPTCHA, or automatic-pricing behavior.
