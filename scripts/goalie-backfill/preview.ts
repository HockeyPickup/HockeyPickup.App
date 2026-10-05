/**
 * yarn goalie-backfill:preview
 *
 * Reads Sessions, AspNetUsers and SessionRosters (SELECT only) from HOCKEYPICKUP_DB and writes the
 * human-review files to out/: names.csv (one row per distinct name), sessions.csv (one row per
 * session whose note mentions a goalie) and summary.txt. Exits non-zero while any REVIEW name or
 * unresolved conflict remains; resolve them in overrides.json and run again.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { analyze } from './analyze';
import { loadBackfillData } from './db';
import { loadOverrides } from './overrides';
import { namesCsv, reviewNames, sessionsCsv, summaryText, unresolvedConflicts } from './report';

const here = import.meta.dirname;
const outDir = join(here, 'out');

const main = async (): Promise<number> => {
  const overrides = loadOverrides(join(here, 'overrides.json'));
  const data = await loadBackfillData();
  const analysis = analyze(data, overrides);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'names.csv'), namesCsv(analysis));
  writeFileSync(join(outDir, 'sessions.csv'), sessionsCsv(analysis));
  const summary = summaryText(data, analysis);
  writeFileSync(join(outDir, 'summary.txt'), summary);

  console.info(summary);
  console.info(`Wrote ${join(outDir, 'names.csv')}, sessions.csv and summary.txt`);

  return reviewNames(analysis).length > 0 || unresolvedConflicts(analysis).length > 0 ? 1 : 0;
};

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 2;
  });
