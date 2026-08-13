import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { ensureEnvironment, createKysely } from "./kysely-config.js";
import { syncCoverArt } from "./sync-cover-art.js";
// pick up any art dropped in tools/seed-assets/cover-art before the catalog loads
const unmatchedArt = await syncCoverArt();
const { buildCatalog } = await import("../src/seed-data/catalog.js");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "content");
const CONTENT_ROOT = "http://localhost:8098/content";
const CORE_API = process.env.CORE_API || "http://localhost:8084";
const ADMIN_EMAIL = "demo@b1.church";
const ADMIN_PASSWORD = "password";

async function resolveAdminUserId(): Promise<string> {
  let resp: Response;
  try {
    resp = await fetch(`${CORE_API}/membership/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
  } catch {
    throw new Error(`Core Api is not reachable at ${CORE_API} — start it first (npm --prefix ../Api run dev)`);
  }
  if (!resp.ok) throw new Error(`Login as ${ADMIN_EMAIL} failed (${resp.status}) — is the membership demo DB loaded?`);
  const data: any = await resp.json();
  if (!data?.user?.id) throw new Error("Login response had no user id");
  return data.user.id;
}

async function run() {
  await ensureEnvironment();
  const adminUserId = await resolveAdminUserId();
  const db = createKysely();

  try {
    await db.deleteFrom("reports").execute();
    await db.deleteFrom("songs").execute();
    await db.deleteFrom("admins").execute();
    await db.deleteFrom("sings").execute();
    await db.insertInto("admins").values({ userId: adminUserId, email: ADMIN_EMAIL }).execute();

    const { rows, files } = buildCatalog(CONTENT_ROOT);

    if (unmatchedArt.length) console.warn(`WARNING: cover art matches no song title: ${unmatchedArt.join(", ")}`);

    for (const row of rows) await db.insertInto("songs").values(row).execute();

    fs.rmSync(path.join(CONTENT_DIR, "songs"), { recursive: true, force: true });
    for (const f of files) {
      const target = path.join(CONTENT_DIR, ...f.key.split("/"));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(__dirname, "seed-assets", ...f.src.split("/")), target);
    }

    console.log(`Seeded ${rows.length} songs (${files.length} content files), admin ${ADMIN_EMAIL} (${adminUserId}).`);
  } finally {
    await db.destroy();
  }
}

run().catch(err => {
  console.error("Seed failed:", err.message || err);
  process.exit(1);
});
