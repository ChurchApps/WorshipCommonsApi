import { type Kysely } from "kysely";
import { idFor } from "../seed-data/catalog.js";

// The launch catalog included 13 fictional "WC-licensed" demo songs (invented
// writers, placeholder lyrics). Remove them and re-point the translation
// relations at real PD hymns instead.
const FICTIONAL_TITLES = [
  "Every Valley",
  "Bread and Cup",
  "The Lord Is Near",
  "Morning Will Come",
  "Slow to Anger",
  "Todo Valle",
  "Tunakuabudu",
  "House of Bread",
  "Rise Up, O Sleeper",
  "Table Wide as Mercy",
  "Watchman's Song (How Long)",
  "God With Us Still",
  "Sower's Song"
];

const RELATIONS: [string, string, string][] = [
  ["Stille Nacht", "Silent Night", "German original · Mohr & Gruber, 1818"],
  ["Noche de Paz", "Silent Night", "Spanish translation · tr. Federico Fliedner, 1871"],
  ["Adeste Fideles", "O Come, All Ye Faithful", "Latin original · John F. Wade, 1751"],
  ["Ein feste Burg ist unser Gott", "A Mighty Fortress Is Our God", "German original · Martin Luther, 1529"]
];

export async function up(db: Kysely<any>): Promise<void> {
  await db.deleteFrom("songs").where("id", "in", FICTIONAL_TITLES.map(idFor)).execute();
  for (const [child, parent, label] of RELATIONS) {
    await db.updateTable("songs")
      .set({ parentSongId: idFor(parent), relationLabel: label })
      .where("id", "=", idFor(child))
      .execute();
  }
}

export async function down(): Promise<void> {}
