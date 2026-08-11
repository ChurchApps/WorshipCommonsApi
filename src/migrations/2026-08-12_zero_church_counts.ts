import { type Kysely } from "kysely";

// launch churchCounts were fabricated seed values; reset all counters to zero
export async function up(db: Kysely<any>): Promise<void> {
  await db.updateTable("songs").set({ churchCount: 0 }).execute();
}

export async function down(): Promise<void> {}
