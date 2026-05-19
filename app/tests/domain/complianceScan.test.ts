import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

describe('domain core compliance boundary', () => {
  it('does not include live collection, credential, browser, storage, or automatic pricing code', () => {
    const source = filesUnder('src/domain/pricing')
      .filter((path) => path.endsWith('.ts'))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');

    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|axios|document\.cookie|localStorage|sessionStorage/);
    expect(source).not.toMatch(/playwright|selenium|puppeteer|captcha|crawler|scrap/i);
    expect(source).not.toMatch(/api[_-]?key|secret|password|credential/i);
    expect(source).not.toMatch(/auto(?:matic)?\s*price|auto(?:matic)?\s*rate|recommendedPriceCents/);
  });
});
