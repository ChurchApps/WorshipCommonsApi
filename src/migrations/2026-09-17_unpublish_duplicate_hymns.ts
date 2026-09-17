import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";

// Unpublish English listings that were the same hymn under a second title.
// Keepers stay published (votes/saves/sings on the dropped ids survive).
const IDS = [
  "ihAaujJz9jC", // Come Thou Fount (keep Come Thou Fount Of Every Blessing)
  "c6lqqDbza45", // At the Cross copy (chorus merged into 4m8Ep0PePd0)
  "ihlFEWgSv9K", // O For A Thousand Tongues (keep …to Sing)
  "QXzidSnHZnc", // My Savior's Love (keep I Stand Amazed)
  "_vZQ35MZdYv"  // Low in the Grave He Lay (keep Christ Arose)
];

const KEEPERS = new Set([
  "4m8Ep0PePd0", // retitled At the Cross + Hudson chorus
  "FMd8ryghVRb", // scripture 1 Samuel 7:12
  "j_MZHyq0e2w"  // title includes My Savior's Love
]);

export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const catalog = JSON.parse(readFileSync("config/catalog.json", "utf8"));
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    const [r] = await pool.query(
      "update assets set status = 'unpublished', unpublishedAt = now(), removedReason = 'duplicate listing of the same hymn' where status = 'published' and id in (?)",
      [IDS]
    );
    console.log(`unpublish_duplicate_hymns: ${(r as { affectedRows: number }).affectedRows} of ${IDS.length} unpublished`);
    let n = 0;
    for (const row of catalog.rows as any[]) {
      if (!KEEPERS.has(row.id)) continue;
      const [a] = await pool.query(
        "update assets set name = ?, tags = ? where id = ?",
        [row.title, row.themes || null, row.id]
      );
      const [s] = await pool.query(
        "update songs set chordPro = ?, scripture = ? where assetId = ?",
        [row.chordPro, row.scripture || null, row.id]
      );
      n += (a as { affectedRows: number }).affectedRows + (s as { affectedRows: number }).affectedRows;
    }
    console.log(`unpublish_duplicate_hymns: ${n} keeper rows patched from catalog`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
