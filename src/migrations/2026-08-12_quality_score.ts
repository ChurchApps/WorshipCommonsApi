import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("songs")
    .addColumn("qualityScore", "integer")
    .addColumn("qualityDetail", "text")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("songs").dropColumn("qualityScore").dropColumn("qualityDetail").execute();
}
