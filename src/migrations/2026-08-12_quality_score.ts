import { sql, type Kysely } from "kysely";

async function hasColumn(db: Kysely<any>, col: string): Promise<boolean> {
  const r = await sql`SHOW COLUMNS FROM songs LIKE ${col}`.execute(db);
  return r.rows.length > 0;
}

// prod already had these columns before the migration was recorded; add only what's missing
export async function up(db: Kysely<any>): Promise<void> {
  if (!(await hasColumn(db, "qualityScore"))) await db.schema.alterTable("songs").addColumn("qualityScore", "integer").execute();
  if (!(await hasColumn(db, "qualityDetail"))) await db.schema.alterTable("songs").addColumn("qualityDetail", "text").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("songs").dropColumn("qualityScore").dropColumn("qualityDetail").execute();
}
