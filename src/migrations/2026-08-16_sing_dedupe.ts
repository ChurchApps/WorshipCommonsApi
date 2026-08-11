import { type Kysely, sql } from "kysely";

// churchCount drives the default sort but /sing was anonymous and unthrottled;
// dedupe by (songId, hashed IP) so one network can only count a song once
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("sings")
    .ifNotExists()
    .addColumn("songId", sql`char(11)`, (col) => col.notNull())
    .addColumn("ipHash", sql`char(16)`, (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("pk_sings", ["songId", "ipHash"])
    .modifyEnd(sql`ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("sings").ifExists().execute();
}
