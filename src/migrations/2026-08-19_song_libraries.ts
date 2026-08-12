import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("libraries")
    .ifNotExists()
    .addColumn("userId", sql`char(11)`, (col) => col.notNull())
    .addColumn("songId", sql`char(11)`, (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("pk_libraries", ["userId", "songId"])
    .modifyEnd(sql`ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("libraries").ifExists().execute();
}
