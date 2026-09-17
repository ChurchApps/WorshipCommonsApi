import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";

// Copy each live song's rights object from the vendored content repo (config/rights.json,
// assetId -> song.json rights) so the API stops serving stale PD review notes.
export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const rights: Record<string, unknown> = JSON.parse(readFileSync("config/rights.json", "utf8"));
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    let n = 0;
    for (const [id, r] of Object.entries(rights)) {
      const json = JSON.stringify(r);
      const [res] = await pool.query("update songs set rights = ? where assetId = ? and (rights is null or rights <> ?)", [json, id, json]);
      n += (res as { affectedRows: number }).affectedRows;
    }
    console.log(`sync_rights: ${n} songs updated`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
