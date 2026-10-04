/**
 * yarn goalie-backfill:generate
 *
 * Re-runs the preview analysis (SELECT only) and, when nothing needs a human decision, writes the
 * three SQL scripts for Brett to review and run in SSMS:
 *   out/01_create_legacy_goalies.sql   legacy stub users (D7)
 *   out/02_insert_goalie_rosters.sql   goalie roster rows + "convert" updates
 *   out/03_strip_goalie_notes.sql      backup + strip notes (D8) — run last, after the front end ships
 * Refuses to write anything while a REVIEW name or an unresolved conflict remains.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { analyze } from './analyze';
import { loadBackfillData } from './db';
import { loadOverrides } from './overrides';
import { reviewNames, unresolvedConflicts } from './report';
import { createLegacyGoaliesSql, insertGoalieRostersSql, stripGoalieNotesSql } from './sql';

const here = import.meta.dirname;
const outDir = join(here, 'out');

const main = async (): Promise<number> => {
  const overrides = loadOverrides(join(here, 'overrides.json'));
  const data = await loadBackfillData();
  const analysis = analyze(data, overrides);

  const review = reviewNames(analysis);
  const unresolved = unresolvedConflicts(analysis);
  if (review.length > 0 || unresolved.length > 0) {
    console.error(
      `Refusing to generate: ${review.length} REVIEW name(s) and ${unresolved.length} unresolved conflict(s) remain. ` +
        'Run yarn goalie-backfill:preview and resolve them in overrides.json.',
    );
    return 1;
  }

  mkdirSync(outDir, { recursive: true });
  const files: [string, string][] = [
    ['01_create_legacy_goalies.sql', createLegacyGoaliesSql(analysis)],
    ['02_insert_goalie_rosters.sql', insertGoalieRostersSql(analysis)],
    ['03_strip_goalie_notes.sql', stripGoalieNotesSql(analysis)],
  ];
  for (const [name, content] of files) {
    writeFileSync(join(outDir, name), content);
    console.info(`Wrote ${join(outDir, name)}`);
  }
  return 0;
};

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 2;
  });
