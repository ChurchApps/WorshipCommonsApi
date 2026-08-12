import { ensureEnvironment, createKysely } from "./kysely-config.js";
await ensureEnvironment();
const db = createKysely();
try {
  const total = await db.selectFrom("songs").select(db.fn.countAll().as("n")).executeTakeFirst();
  const withVid = await db.selectFrom("songs").select(db.fn.countAll().as("n")).where("videoUrl", "is not", null).executeTakeFirst();
  const rows = await db.selectFrom("songs").select(["id", "title", "videoUrl", "status"]).where("title", "in", ["To God Be the Glory", "He Keeps Me Singing"]).execute();
  console.log("total:", total?.n, "withVideo:", withVid?.n);
  console.log(JSON.stringify(rows, null, 1));
} finally { await db.destroy(); }
