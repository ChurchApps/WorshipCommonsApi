import { type Kysely, sql } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Writer-supplied CCLI id, and re-point midiUrl at the recording-sketch score.mid
// for granted masters (catalog already prefers that file when there is no ABC).
export async function up(db: Kysely<any>): Promise<void> {
  const hasCcli = await sql<{ Field: string }>`SHOW COLUMNS FROM songs LIKE "ccli"`.execute(db);
  if (!hasCcli.rows.length) {
    await db.schema.alterTable("songs").addColumn("ccli", sql`varchar(16)`).execute();
  }

  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    const patch: Record<string, unknown> = {};
    if (row.midiUrl !== undefined) {
      patch.midiUrl = row.midiUrl ?? null;
      patch.midiBytes = row.midiBytes ?? null;
    }
    if (row.ccli !== undefined) patch.ccli = row.ccli ?? null;
    if (!Object.keys(patch).length) continue;
    await db.updateTable("songs").set(patch).where("id", "=", row.id).execute();
  }
}

export async function down(): Promise<void> {}
