import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Hymnal "Children" had been mapped to Kids, so adult hymns (Heavenly Father
// Send Thy Blessing, Shepherd of Tender Youth, A Child of the King, …) showed
// under theme=Kids. Catalog now keeps Kids only on known children's choruses.
export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  for (const row of rows) {
    await db.updateTable("songs")
      .set({ themes: row.themes ?? null })
      .where("id", "=", row.id)
      .execute();
  }
}

export async function down(): Promise<void> {}
