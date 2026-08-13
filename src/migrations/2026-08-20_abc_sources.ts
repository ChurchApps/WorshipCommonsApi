import { type Kysely, sql } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Adds abcUrl and points catalog songs at their engraving source
// (content/songs/<id>/tune.abc; the ABC masters live in the WorshipCommonsContent repo).
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("songs").addColumn("abcUrl", sql`varchar(255)`).execute();

  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    if (!row.abcUrl) continue;
    await db.updateTable("songs").set({ abcUrl: row.abcUrl }).where("id", "=", row.id).execute();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("songs").dropColumn("abcUrl").execute();
}
