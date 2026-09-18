import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";

// repair_truncated_file_names completes a cut-off basename. Rows cut off inside the folder path
// ("…-uUc9TW1C2sd/derivati", "…/sources/") have nothing to complete and surface as the fileUrls
// keys "derivati" and "". The catalog re-key already inserted the real files; drop the stubs.
// Extension-bearing basenames (sources/extra/*.mp3, title-BPM mixes) are real files and stay.
export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    const [r] = await pool.query(
      "delete from assetFiles where submissionId is null and name like 'songs/%' and substring_index(name, '/', -1) not like '%.%'"
    );
    console.log(`truncated_file_stubs: ${(r as { affectedRows: number }).affectedRows} deleted`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
