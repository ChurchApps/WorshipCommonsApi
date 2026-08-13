import { type Kysely, sql } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Adds the song hero cover art column and backfills the songs that have one
// (see src/seed-data/art-map.ts). Songs without art keep falling back to the
// procedural SVG cover the web app draws from title + themes.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("songs").addColumn("artUrl", sql`varchar(255)`).execute();

  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    if (!row.artUrl) continue;
    await db.updateTable("songs").set({ artUrl: row.artUrl }).where("id", "=", row.id).execute();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("songs").dropColumn("artUrl").execute();
}
