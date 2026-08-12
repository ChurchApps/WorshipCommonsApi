import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Adds hymnalCount — how many hymnals each song appears in per hymnary.org
// (see tools/import-hymnary-popularity.ts). Popularity proxy for ranking until
// real usage data (churchCount from sings) accumulates.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("songs").addColumn("hymnalCount", "integer", (col) => col.notNull().defaultTo(0)).execute();

  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    if (!row.hymnalCount) continue;
    await db.updateTable("songs").set({ hymnalCount: row.hymnalCount }).where("id", "=", row.id).execute();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("songs").dropColumn("hymnalCount").execute();
}
