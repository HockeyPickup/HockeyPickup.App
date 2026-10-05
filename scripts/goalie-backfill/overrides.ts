import { readFileSync } from 'node:fs';
import type { ConflictResolution, Overrides } from './model';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const RESOLUTIONS: ConflictResolution[] = ['skip', 'convert', 'accept'];

const fail = (message: string): never => {
  throw new Error(`overrides.json: ${message}`);
};

/** Reads and strictly validates overrides.json; Brett edits it between preview runs. */
export const loadOverrides = (path: string): Overrides => {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (!isRecord(parsed)) return fail('expected an object');

  const link = parsed.link ?? {};
  const create = parsed.create ?? {};
  const ignore = parsed.ignore ?? [];
  const conflicts = parsed.conflicts ?? {};
  if (!isRecord(link) || !isRecord(create) || !Array.isArray(ignore) || !isRecord(conflicts)) {
    return fail('expected { link: {}, create: {}, ignore: [], conflicts: {} }');
  }

  const overrides: Overrides = { link: {}, create: {}, ignore: [], conflicts: {} };

  for (const [name, id] of Object.entries(link)) {
    if (typeof id !== 'string' || id.length === 0) fail(`link["${name}"] must be an AspNetUsers.Id`);
    overrides.link[name] = String(id);
  }

  for (const [name, value] of Object.entries(create)) {
    if (!isRecord(value) || typeof value.FirstName !== 'string' || typeof value.LastName !== 'string') {
      return fail(`create["${name}"] must be { "FirstName": "...", "LastName": "..." }`);
    }
    if (!value.FirstName.trim() || !value.LastName.trim()) fail(`create["${name}"] needs a first and last name`);
    overrides.create[name] = { FirstName: value.FirstName, LastName: value.LastName };
  }

  for (const name of ignore) {
    if (typeof name !== 'string') fail('ignore must be a list of names');
    overrides.ignore.push(String(name));
  }

  for (const [key, value] of Object.entries(conflicts)) {
    const resolution = RESOLUTIONS.find((candidate) => candidate === value);
    if (!resolution) return fail(`conflicts["${key}"] must be one of ${RESOLUTIONS.join(', ')}`);
    overrides.conflicts[key] = resolution;
  }

  return overrides;
};
