import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";

// Second pass of 2026-09-17 PD takedowns: undated Cyber Hymnal songs whose texts are
// copyrighted (1931 renewed; Koechlin b. 1920) or have no printing before 1931.
// Mirrors the admin unpublish action; republish by setting status back.
const IDS = [
  "2yiCeYDsb1Q",
  "H3wsmZbhJ-7",
  "TUCdQhUdmQi",
  "TdPDaQQ7sf0",
  "p209eQVdiIt",
  "qu6Vl4MKHlu"
];

export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    const [r] = await pool.query(
      "update assets set status = 'unpublished', unpublishedAt = now(), removedReason = 'public-domain claim did not hold up' where status = 'published' and id in (?)",
      [IDS]
    );
    console.log(`takedown_pd_rights_2: ${(r as { affectedRows: number }).affectedRows} of ${IDS.length} songs unpublished`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
