import { type Kysely } from "kysely";
import { createPool } from "mysql2/promise";

// Take down the Larry Holder / Elton Smith songs removed from the catalog on
// 2026-09-16 pending Elton Smith's permission. Mirrors the admin unpublish
// action so votes, saves and sings survive; republish by setting status back.
const IDS = [
  "-W2fJ6DJThT",
  "-Zm8GyHWSBO",
  "1KVURjlrMf6",
  "1UFTs47No0T",
  "1UoeiinQR73",
  "2I0ZFYWO0uP",
  "2RHvyuKVdht",
  "3qhB-JwbKc9",
  "4Me0cWpBpqC",
  "4b4QgqBlXC7",
  "5WFeMhIgV2T",
  "7D9-FOIj-z7",
  "8mv_HvJwVh0",
  "9hvAYiSl6nj",
  "AULdbmQEI9O",
  "Bvou_81ZTBV",
  "D9ylItyFdYl",
  "DHPrDpp1ylE",
  "HSIoBK0s1Rl",
  "I-pYBLnS8nj",
  "KeIkzBPqJgW",
  "Kw-gzSEm-3Z",
  "MiEKfYImEIO",
  "NqGHEhKUjxq",
  "R9hnbySn7rx",
  "RS95hiusHM3",
  "SYjNqtFfpiY",
  "VSfxz19vdKz",
  "VZ350sv6nkP",
  "ZvtNNU5OLqr",
  "_6zv6iZLTT1",
  "boiXTnyBOkw",
  "bzVUrhYVsio",
  "c0hPhfkUWRc",
  "ccPsQzGd7sl",
  "dkNRuydh6Y0",
  "eV1Fdy0I8mS",
  "fb9gmmNnikd",
  "g2wSzutqCPa",
  "ggMyOnOkCxw",
  "glWQUMDTIdy",
  "gme21eQLbdR",
  "hP3uyZec4HY",
  "ijqCb0BDz8t",
  "jiMYDwlVP7U",
  "k7gx01kDSYl",
  "k7hBfCs3_lO",
  "kRm6c3OYNUb",
  "keHKSJKG07j",
  "lEkR4gPDRUL",
  "lUvSZvxiPpK",
  "lXNVmeYpAWJ",
  "lo8m7SS1Bqj",
  "lpUrPTJL-v6",
  "lxPMrC5ZCxQ",
  "mzymlkNkgxS",
  "ooQwlDcu_5y",
  "qR-_GWe0UCn",
  "qyTCY1U1RTC",
  "qyi8XdwvDto",
  "tlRfkz0YczT",
  "uaY1jTveA-v",
  "vXzVZUdqKE4",
  "vnTuC7uJ4Su",
  "vrmsLeTe23L",
  "vxcZ9ygvhks",
  "wQat9Fnj2yP",
  "xMY7_bXfH1E",
  "yOw23Z2yG6g",
  "z5XfOXA7wD6",
  "zD6UkRaAujf",
  "zlmDDDjuwKa",
  "zz9dMpgAUUO"
];

export async function up(_db: Kysely<any>): Promise<void> {
  const uri = process.env.COMMONS_CONNECTION_STRING;
  if (!uri) return;
  const pool = createPool({ uri, charset: "utf8mb4" });
  try {
    const [r] = await pool.query(
      "update assets set status = 'unpublished', unpublishedAt = now(), removedReason = 'pending writer permission' where status = 'published' and id in (?)",
      [IDS]
    );
    console.log(`takedown_elton_smith: ${(r as { affectedRows: number }).affectedRows} of ${IDS.length} songs unpublished`);
  } finally {
    await pool.end();
  }
}

export async function down(): Promise<void> {}
