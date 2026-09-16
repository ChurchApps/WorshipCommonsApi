import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";

// Stamp writer-listed CCLI ids on live commons songs from the vendored catalog.
export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const catalog = JSON.parse(readFileSync("config/catalog.json", "utf8"));
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    let n = 0;
    for (const row of catalog.rows as any[]) {
      if (!row.ccli) continue;
      const [r] = await pool.query("update songs set ccli = ? where assetId = ? and (ccli is null or ccli <> ?)", [row.ccli, row.id, row.ccli]);
      n += (r as { affectedRows: number }).affectedRows;
    }
    console.log(`sync_ccli: ${n} songs updated`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
