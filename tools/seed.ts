import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { ensureEnvironment, createKysely } from "./kysely-config.js";
import { buildCatalog } from "../src/seed-data/catalog.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "content");
// content masters live in the WorshipCommonsContent checkout
const LIBRARY_DIR = path.resolve(process.env.CONTENT_LIBRARY_DIR || path.join(__dirname, "..", "..", "WorshipCommonsContent"));
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

    const { rows } = buildCatalog(CONTENT_ROOT);

    for (const row of rows) await db.insertInto("songs").values(row).execute();

    // content/ mirrors the library repo layout, exactly like the prod bucket
    for (const dir of ["songs", "writers", "works"]) {
      fs.rmSync(path.join(CONTENT_DIR, dir), { recursive: true, force: true });
      fs.cpSync(path.join(LIBRARY_DIR, dir), path.join(CONTENT_DIR, dir), { recursive: true });
    }

    console.log(`Seeded ${rows.length} songs (content/ mirrors the library), admin ${ADMIN_EMAIL} (${adminUserId}).`);
  } finally {
    await db.destroy();
  }
}

run().catch(err => {
  console.error("Seed failed:", err.message || err);
  process.exit(1);
});
