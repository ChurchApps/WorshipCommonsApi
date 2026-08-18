import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Content #8 added public-domain tune.mid for 46 catalog songs. Vendored
// catalog.json is now 1401 rows. Re-points midiUrl/midiBytes from the
// refreshed catalog (null when the catalog has no midi — do not invent)
// and refreshes artUrl when present. Inserts any catalog id missing from
// songs. Existing rows keep churchCount, hymnalCount, certified, status,
// and user-submitted fields.
export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  const existing = await db.selectFrom("songs").select("id").where("id", "in", rows.map(r => r.id)).execute();
  const have = new Set(existing.map((r: any) => r.id));
  const missing = rows.filter(r => !have.has(r.id));

  for (const row of rows) {
    if (!have.has(row.id)) continue;
    const patch: Record<string, unknown> = {
      midiUrl: row.midiUrl ?? null,
      midiBytes: row.midiBytes ?? null
    };
    if (row.artUrl) patch.artUrl = row.artUrl;
    await db.updateTable("songs").set(patch).where("id", "=", row.id).execute();
  }

  for (let i = 0; i < missing.length; i += 50) {
    await db.insertInto("songs").values(missing.slice(i, i + 50)).execute();
  }
}

// data backfill — prior values aren't recoverable
export async function down(): Promise<void> {}
