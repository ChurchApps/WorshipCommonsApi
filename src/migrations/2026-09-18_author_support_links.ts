import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";

// Live commons authors.links: Support the writer for Larry Holder and Elton Smith.
// Source of truth is WorshipCommonsContent writers/<slug>/writer.json; this one-shot
// applies it on prod (VPC-only) the same way commons-sync-catalog does from a laptop.
const LARRY = { label: "Larry Holder Music", url: "https://larryholdermusic.org/", support: true };
const ELTON = { label: "Songs of Praise", url: "https://songsofpraise.org/", support: true };

function linksFor(name: string) {
  const links: { label: string; url: string; support: boolean }[] = [];
  if (name.includes("Larry Holder")) links.push(LARRY);
  if (name.includes("Elton Smith")) links.push(ELTON);
  return links.length ? JSON.stringify(links) : null;
}

export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    const [rows] = await pool.query(
      "select id, name, userId, links from authors where name like ? or name like ?",
      ["%Larry Holder%", "%Elton Smith%"]
    );
    let patched = 0;
    for (const row of rows as { id: string; name: string; userId: string | null; links: string | null }[]) {
      if (row.userId) continue;
      const links = linksFor(row.name);
      if ((row.links || null) === links) continue;
      await pool.query("update authors set links = ? where id = ?", [links, row.id]);
      patched++;
    }
    console.log("author_support_links", { patched });
  } finally {
    await pool.end();
  }
}

export async function down(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    await pool.query(
      "update authors set links = null where userId is null and (name like ? or name like ?)",
      ["%Larry Holder%", "%Elton Smith%"]
    );
  } finally {
    await pool.end();
  }
}
