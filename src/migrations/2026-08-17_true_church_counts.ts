import { type Kysely, sql } from "kysely";

// Fabricated launch-era churchCounts resurfaced in existing databases (the
// 2026-08-12 zeroing only fixed rows that existed then). Recompute every count
// from the sings table — the only source of truth — so no value is made up.
export async function up(db: Kysely<any>): Promise<void> {
  await db.updateTable("songs").set({ churchCount: 0 }).execute();
  await sql`update songs s
    join (select songId, count(*) n from sings group by songId) c on c.songId = s.id
    set s.churchCount = c.n`.execute(db);
}

export async function down(): Promise<void> {}
