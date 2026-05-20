import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');
const layoutCss = readFileSync(resolve(process.cwd(), 'src/styles/layout.css'), 'utf8');

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

  it('does not define raw color functions outside the token layer', () => {
    expect(layoutCss).not.toMatch(/rgba?\(/);
  });

  it('defines Revenue Observatory surfaces through token-layer variables', () => {
    expect(css).toContain('--observatory-glass-surface:');
    expect(css).toContain('--observatory-grid-line:');
    expect(css).toContain('--observatory-cyan-signal:');
    expect(css).toContain('--observatory-copper-accent:');
    expect(css).toContain('--observatory-shell-max: 2000px;');
    expect(css).toContain('--observatory-page-surface:');
    expect(css).toContain('--observatory-instrument-surface:');
    expect(css).toContain('--observatory-chart-frame:');
    expect(css).toContain('--observatory-insight-surface:');
    expect(css).toContain('--observatory-signal-rail:');
    expect(layoutCss).toContain('.app-shell[data-visual-system="revenue-observatory"]');
    expect(layoutCss).toContain('.app-header__signal-rail');
    expect(layoutCss).toContain('.observatory-panel');
    expect(layoutCss).toContain('.instrument-header');
    expect(layoutCss).toContain('.metric-lattice');
    expect(layoutCss).toContain('.insight-rail');
    expect(layoutCss).toContain('.chart-frame');
    expect(layoutCss).toContain('data-visual-system="revenue-observatory"');
    expect(layoutCss).toContain('scope-observatory-map');
    expect(layoutCss).toContain('capture-signal-rail');
  });
});
