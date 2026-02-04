import { describe, it, expect } from 'vitest';
import { generateId, generateJobId, generateProjectId } from './id';

describe('id utilities', () => {
  it('generateId creates unique IDs with prefix', () => {
    const id1 = generateId('TEST');
    const id2 = generateId('TEST');

    expect(id1).toMatch(/^TEST-\d+-[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('generateJobId creates job IDs', () => {
    const id = generateJobId();
    expect(id).toMatch(/^JOB-/);
  });

  it('generateProjectId creates project IDs', () => {
    const id = generateProjectId();
    expect(id).toMatch(/^PRJ-/);
  });
});
