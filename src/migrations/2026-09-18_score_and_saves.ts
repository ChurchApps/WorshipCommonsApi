import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";

// ABC conversion is a typeset score. Star ratings are out; downloads + saves remain.
// Runs against the live ChurchApps commons DB (COMMONS_CONNECTION_STRING).
export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    const [cols] = await pool.query("show columns from assets like 'saveCount'");
    if (!(cols as any[]).length) {
      await pool.query("alter table assets add column saveCount int not null default 0");
    }
    await pool.query("update assets a join (select assetId, count(*) as n from assetRatings where saved = 1 group by assetId) r on r.assetId = a.id set a.saveCount = r.n");
    const [remap] = await pool.query("update songs set confidence = 'score' where confidence in ('proofread-score', 'converted-from-abc')");
    console.log("score_and_saves", { remapped: (remap as { affectedRows: number }).affectedRows });
  } finally {
    await pool.end();
  }
}

export async function down(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    await pool.query("alter table assets drop column saveCount").catch(() => {});
  } finally {
    await pool.end();
  }
}
