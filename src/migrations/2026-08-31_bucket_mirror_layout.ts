import { type Kysely } from "kysely";
import { buildCatalog } from "../seed-data/catalog.js";
import { Environment } from "../helpers/Environment.js";

// Bucket layout cutover: the content bucket now mirrors the library repo
// (songs/<lang>/<section>/<slug>/tune.mid, writers/<slug>/portrait.jpg) instead
// of the flat id-keyed layout (songs/<id>/..., writers/<slug>.jpg). Repoints
// catalog songs' url columns at the mirrored keys. Submitted songs (submittedBy
// set) keep their old keys — move those objects by hand if any predate this.
// Bucket prep: `aws s3 sync songs s3://<bucket>/songs` + writers from the
// library checkout BEFORE deploying; delete the old id-keyed objects after.
export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = buildCatalog(Environment.contentRoot);
  for (const r of rows) {
    await db.updateTable("songs")
      .set({ midiUrl: r.midiUrl, lyricsUrl: r.lyricsUrl, abcUrl: r.abcUrl, artUrl: r.artUrl, writerPortraitUrl: r.writerPortraitUrl })
      .where("id", "=", r.id)
      .where("submittedBy", "is", null)
      .execute();
  }
}

// ponytail: no down — the old id-keyed bucket objects are gone after cutover
export async function down(): Promise<void> { /* irreversible layout change */ }
