import { type Kysely, sql } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Adds curated media fields — a YouTube performance link plus a public-domain
// writer portrait and bio excerpt (see tools/import-videos.ts and
// tools/import-writer-portraits.ts) — and backfills catalog songs from the seed maps.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("songs").addColumn("videoUrl", sql`varchar(255)`).execute();
  await db.schema.alterTable("songs").addColumn("writerPortraitUrl", sql`varchar(255)`).execute();
  await db.schema.alterTable("songs").addColumn("writerBio", sql`varchar(1000)`).execute();

  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    if (!row.videoUrl && !row.writerPortraitUrl) continue;
    await db.updateTable("songs")
      .set({ videoUrl: row.videoUrl, writerPortraitUrl: row.writerPortraitUrl, writerBio: row.writerBio })
      .where("id", "=", row.id).execute();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("songs").dropColumn("videoUrl").execute();
  await db.schema.alterTable("songs").dropColumn("writerPortraitUrl").execute();
  await db.schema.alterTable("songs").dropColumn("writerBio").execute();
}
