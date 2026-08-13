import { type Kysely, sql } from "kysely";

// community ABC transcriptions awaiting review — approved ones are promoted
// by hand to the song's folder in the WorshipCommonsContent repo (see .notes/source-of-truth.md)
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("abcSubmissions")
    .ifNotExists()
    .addColumn("id", sql`char(11)`, (col) => col.primaryKey())
    .addColumn("songId", sql`char(11)`, (col) => col.notNull())
    .addColumn("abc", "text", (col) => col.notNull())
    .addColumn("submittedBy", sql`char(11)`, (col) => col.notNull())
    .addColumn("status", sql`varchar(20)`, (col) => col.notNull().defaultTo("pending"))
    .addColumn("createdAt", "datetime", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .modifyEnd(sql`ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("abcSubmissions").ifExists().execute();
}
