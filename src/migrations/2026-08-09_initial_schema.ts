import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("songs")
    .ifNotExists()
    .addColumn("id", sql`char(11)`, (col) => col.notNull().primaryKey())
    .addColumn("title", sql`varchar(255)`, (col) => col.notNull())
    .addColumn("writer", sql`varchar(255)`)
    .addColumn("year", "integer")
    .addColumn("themes", sql`varchar(255)`)
    .addColumn("songKey", sql`varchar(10)`)
    .addColumn("bpm", "integer")
    .addColumn("timeSignature", sql`varchar(10)`)
    .addColumn("language", sql`varchar(50)`)
    .addColumn("scripture", sql`varchar(100)`)
    .addColumn("scriptureText", sql`varchar(500)`)
    .addColumn("license", sql`varchar(2)`)
    .addColumn("churchCount", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("chordPro", "text")
    .addColumn("demoAudioUrl", sql`varchar(255)`)
    .addColumn("demoAudioBytes", "integer")
    .addColumn("sheetPdfUrl", sql`varchar(255)`)
    .addColumn("sheetPdfBytes", "integer")
    .addColumn("stemsZipUrl", sql`varchar(255)`)
    .addColumn("stemsZipBytes", "integer")
    .addColumn("parentSongId", sql`char(11)`)
    .addColumn("relationLabel", sql`varchar(150)`)
    .addColumn("status", sql`varchar(10)`, (col) => col.notNull().defaultTo("pending"))
    .addColumn("submittedBy", sql`char(11)`)
    .addColumn("proAnswer", sql`varchar(150)`)
    .addColumn("certified", sql`bit(1)`)
    .addColumn("createdAt", "datetime", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", "datetime", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .modifyEnd(sql`ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)
    .execute();

  await db.schema.createIndex("idx_songs_status").on("songs").column("status").execute();
  await db.schema.createIndex("idx_songs_parent").on("songs").column("parentSongId").execute();

  await db.schema
    .createTable("reports")
    .ifNotExists()
    .addColumn("id", sql`char(11)`, (col) => col.notNull().primaryKey())
    .addColumn("songText", sql`varchar(255)`, (col) => col.notNull())
    .addColumn("songId", sql`char(11)`)
    .addColumn("reporterRole", sql`varchar(150)`)
    .addColumn("details", "text")
    .addColumn("name", sql`varchar(100)`)
    .addColumn("email", sql`varchar(100)`)
    .addColumn("signature", sql`varchar(100)`)
    .addColumn("status", sql`varchar(10)`, (col) => col.notNull().defaultTo("open"))
    .addColumn("createdAt", "datetime", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .modifyEnd(sql`ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)
    .execute();

  await db.schema.createIndex("idx_reports_status").on("reports").column("status").execute();

  await db.schema
    .createTable("admins")
    .ifNotExists()
    .addColumn("userId", sql`char(11)`, (col) => col.notNull().primaryKey())
    .addColumn("email", sql`varchar(255)`)
    .addColumn("createdAt", "datetime", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .modifyEnd(sql`ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("admins").ifExists().execute();
  await db.schema.dropTable("reports").ifExists().execute();
  await db.schema.dropTable("songs").ifExists().execute();
}
