import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Cover art now exists for every song in the library (882 rows gained art, none lost it).
// Re-points artUrl from the refreshed catalog; standalone songs get their own
// songs/<lang>/<section>/<slug>/art.webp, translation families inherit works/<slug>/art.webp.
// Runs independently of 2026-09-01_works_layout so the art lands whether or not that
// migration has already been applied in a given environment.
export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    if (!row.artUrl) continue;
    await db.updateTable("songs").set({ artUrl: row.artUrl }).where("id", "=", row.id).execute();
  }
}

// data backfill — prior values aren't recoverable
export async function down(): Promise<void> {}
