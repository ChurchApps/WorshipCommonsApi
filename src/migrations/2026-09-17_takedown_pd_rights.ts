import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";

// Take down the 14 public-domain songs removed from the catalog on 2026-09-17 whose
// rights did not hold up (translations of still-copyrighted hymns, unmarked tunes,
// contested claims). Mirrors the admin unpublish action so votes, saves and sings
// survive; republish by setting status back.
const IDS = [
  "-cYuYseUyVy",
  "4BMO52hRv95",
  "8EHxEqoKVxo",
  "MrSjAuEcdb9",
  "NjeGc4v6hnA",
  "PmmVb2Aoz9-",
  "dXLa8wmwkqk",
  "eUcX3y4oeSp",
  "hkLeDABNg-B",
  "jQgprGBRZZI",
  "opvVdM1J5ww",
  "uA7YoP6F89B",
  "vASQtZkVWIk",
  "xzm74LlWGkZ"
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
    console.log(`takedown_pd_rights: ${(r as { affectedRows: number }).affectedRows} of ${IDS.length} songs unpublished`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
