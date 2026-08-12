import { type Kysely, sql } from "kysely";
import { buildCatalog, idFor } from "../seed-data/catalog.js";
import { HYMNS_OH } from "../seed-data/hymns-oh.js";
import { Environment } from "../helpers/Environment.js";

// Adds melody MIDI columns, then upserts the expanded catalog: existing songs get
// midiUrl/midiBytes and corrected timeSignature, Open Hymnal expansion hymns are inserted.
// Runs after seed_catalog, which strips the midi fields it can't insert yet.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("songs").addColumn("midiUrl", sql`varchar(255)`).execute();
  await db.schema.alterTable("songs").addColumn("midiBytes", "integer").execute();

  const { rows } = buildCatalog(Environment.contentRoot);
  const existing = new Set((await db.selectFrom("songs").select("id").execute()).map((r: any) => r.id));
  for (const row of rows) {
    if (existing.has(row.id)) {
      // also clears seed rows' references to the removed fabricated demo/stems files
      await db.updateTable("songs")
        .set({
          midiUrl: row.midiUrl,
          midiBytes: row.midiBytes,
          timeSignature: row.timeSignature,
          demoAudioUrl: null,
          demoAudioBytes: null,
          stemsZipUrl: null,
          stemsZipBytes: null
        })
        .where("id", "=", row.id).execute();
    } else {
      const { lyricsUrl: _lyricsUrl, abcUrl: _abcUrl, ...ins } = row;
      await db.insertInto("songs").values(ins).execute();
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const ids = HYMNS_OH.map((h: any) => idFor(h.t));
  await db.deleteFrom("songs").where("id", "in", ids).execute();
  await db.schema.alterTable("songs").dropColumn("midiUrl").execute();
  await db.schema.alterTable("songs").dropColumn("midiBytes").execute();
}
