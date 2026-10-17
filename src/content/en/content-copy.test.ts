import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const contentDir = join(__dirname, '..');

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

describe('content copy rule', () => {
  it('never uses an em dash in guest-facing copy', () => {
    const offenders = listFiles(contentDir).filter((file) =>
      readFileSync(file, 'utf8').includes('\u2014'),
    );
    expect(offenders).toEqual([]);
  });
});
