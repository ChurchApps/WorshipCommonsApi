import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";

// Fill scripture on live commons songs that have none, from the vendored catalog.
export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const catalog = JSON.parse(readFileSync("config/catalog.json", "utf8"));
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    let n = 0;
    for (const row of catalog.rows as any[]) {
      if (!row.scripture) continue;
      const [r] = await pool.query("update songs set scripture = ? where assetId = ? and (scripture is null or scripture = '')", [row.scripture, row.id]);
      n += (r as { affectedRows: number }).affectedRows;
    }
    console.log(`sync_scripture: ${n} songs updated`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
