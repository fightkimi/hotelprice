import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

function token(name: string): string {
  const match = css.match(new RegExp(`${name}:\\s*(#[0-9A-Fa-f]{6});`));
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
