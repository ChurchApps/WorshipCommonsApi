import { ensureEnvironment, createKysely } from "./kysely-config.js";
import { buildCatalog } from "../src/seed-data/catalog.js";
import { Environment } from "../src/helpers/Environment.js";

await ensureEnvironment();
const db = createKysely();
try {
  const { rows } = buildCatalog(Environment.contentRoot);
  const mapped = rows.filter(r => r.videoUrl);
  let n = 0;
  for (const row of mapped) {
    const r = await db.updateTable("songs").set({ videoUrl: row.videoUrl }).where("id", "=", row.id).execute();
    n += Number(r[0]?.numUpdatedRows ?? 0);
  }
  console.log(`updated ${n} rows (${mapped.length} mapped) [env=${process.env.APP_ENV || "dev"}]`);
} finally {
  await db.destroy();
}
