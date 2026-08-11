import * as crypto from "crypto";
import { HYMNS, HYMN_TEXTS } from "./hymns.js";
import { HYMNS2 } from "./hymns2.js";
import { HYMNS_OH } from "./hymns-oh.js";
import { MIDI_MAP } from "./midi-map.js";
import { MIDI_MAP_HYMNSITE } from "./midi-map-hymnsite.js";
import { LYRIC_MAP } from "./lyric-map.js";

const MIDI: Record<string, { file: string; bytes: number }> = { ...MIDI_MAP_HYMNSITE, ...MIDI_MAP };

// deterministic char(11) id in UniqueIdHelper.shortId's base64url format — stable across reseeds
export const idFor = (title: string) => crypto.createHash("sha1").update("wcsong:" + title).digest("base64url").slice(0, 11);

function chordsFor(key: string) {
  const SHARP = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
  ];
  const FLATS: Record<string, string> = { Bb: "A#", Eb: "D#", Ab: "G#", Db: "C#", Gb: "F#" };
  const root = key.replace("m", "");
  const idx = SHARP.indexOf(FLATS[root] || root);
  if (idx < 0 || key.endsWith("m")) return { I: key, IV: key, V: key, vi: key };
  return { I: root, IV: SHARP[(idx + 5) % 12], V: SHARP[(idx + 7) % 12], vi: SHARP[(idx + 9) % 12] + "m" };
}

function stubChordPro(key: string): string {
  const c = chordsFor(key);
  return [
    "Verse 1",
    `[${c.I}]Sing to the Lord a [${c.IV}]new [${c.I}]song,`,
    `for he has [${c.vi}]done marvelous [${c.V}]things;`,
    `[${c.I}]his right hand and his [${c.IV}]holy [${c.I}]arm`,
    `have worked sal[${c.vi}]vation [${c.V}]for [${c.I}]him.`,
    "",
    "Chorus",
    `[${c.IV}]Shout for [${c.V}]joy to the [${c.I}]Lord,`,
    `[${c.IV}]all the [${c.V}]earth burst forth in [${c.vi}]praise;`,
    `[${c.IV}]make music [${c.vi}]to the [${c.V}]Lord`,
    `with the [${c.IV}]harp and [${c.V}]song of [${c.I}]praise.`
  ].join("\n");
}

const EVERY_VALLEY = `Verse 1
[D]Every valley shall [G]be [D]lifted,
every [Bm]mountain be made [A]low;
[D]every crooked road made [G]straight [D]now —
where the [Em]Lord will [A]surely [D]go.

Chorus
[G]Prepare the [A]way of the [D]Lord,
[G]prepare the [A]way of the [Bm]Lord —
[G]all flesh shall see it to[Em]gether:
[G]prepare the [A]way of the [D]Lord.

Verse 2
[D]Grass will wither, [G]flowers [D]falter,
all our [Bm]glory fades like [A]breath;
[D]but the word of [G]God un[D]changing
stands when [Em]nothing [A]else is [D]left.

Bridge
[Bm]He will feed his flock like a [G]shepherd,
[D]he will gather the lambs in his [A]arms.`;

const AMAZING_GRACE = `Verse 1
[G]Amazing grace! how [C]sweet the [G]sound,
that saved a wretch like [D]me!
[G]I once was lost, but [C]now am [G]found,
was [Em]blind, but [D]now I [G]see.

Verse 2
'Twas [G]grace that taught my [C]heart to [G]fear,
and grace my fears re[D]lieved;
how [G]precious did that [C]grace ap[G]pear
the [Em]hour I [D]first be[G]lieved.`;

const BREAD_AND_CUP = `Verse 1
[G]Here at the table [C]spread for [G]us,
the bread is broken, [D]poured the wine;
[G]this is the body [C]given [G]up,
this [Em]cup the cove[D]nant di[G]vine.

Chorus
[C]Take and [D]eat, re[G]member him,
[C]take and [D]drink, his [Em]grace made known;
[C]until he [Em]comes we [D]tell it out:
the [C]Lord has [D]made this [G]table home.`;

// the 21 curated songs from the original mockup library
const SONGS = [
  { t: "Amazing Grace", a: "John Newton", y: 1779, th: "Grace,Assurance", k: "G", bpm: 84, ts: "3/4", lang: "English", scr: "John 9:25", lic: "PD", cong: 0, chordPro: AMAZING_GRACE },
  { t: "Be Thou My Vision", a: "Irish, 8th c. · tr. Byrne", y: 1905, th: "Trust,Adoration", k: "E", bpm: 76, ts: "3/4", lang: "English", scr: "Psalm 16:8", lic: "PD", cong: 0 },
  { t: "Holy, Holy, Holy", a: "Reginald Heber", y: 1826, th: "Adoration,Praise", k: "D", bpm: 92, lang: "English", scr: "Revelation 4:8", lic: "PD", cong: 0 },
  { t: "Come Thou Fount", a: "Robert Robinson", y: 1758, th: "Grace,Praise", k: "D", bpm: 88, ts: "3/4", lang: "English", scr: "1 Samuel 7:12", lic: "PD", cong: 0 },
  { t: "Doxology", a: "Thomas Ken", y: 1674, th: "Praise", k: "G", bpm: 76, lang: "English", scr: "Psalm 100", lic: "PD", cong: 0 },
  { t: "It Is Well with My Soul", a: "Horatio Spafford", y: 1873, th: "Comfort,Assurance", k: "C", bpm: 66, lang: "English", scr: "Psalm 46:1", lic: "PD", cong: 0 },
  { t: "All Creatures of Our God and King", a: "Francis of Assisi · tr. Draper", y: 1919, th: "Praise,Creation", k: "D", bpm: 100, ts: "6/4", lang: "English", scr: "Psalm 148", lic: "PD", cong: 0 },
  { t: "Ein feste Burg ist unser Gott", a: "Martin Luther", y: 1529, th: "Trust,Assurance", k: "C", bpm: 96, lang: "German", scr: "Psalm 46", lic: "PD", cong: 0 },
  {
    t: "Every Valley",
    a: "Miriam Okafor",
    y: 2023,
    th: "Advent,Comfort,Hope",
    k: "D",
    bpm: 72,
    lang: "English",
    scr: "Isaiah 40:4",
    lic: "WC",
    cong: 0,
    chordPro: EVERY_VALLEY,
    scrText: "“Every valley shall be lifted up, and every mountain and hill be made low.” — Isaiah 40:4"
  },
  { t: "Bread and Cup", a: "Andrés Delgado", y: 2024, th: "Communion,Grace", k: "G", bpm: 68, lang: "English", scr: "Luke 22:19", lic: "WC", cong: 0, chordPro: BREAD_AND_CUP },
  { t: "The Lord Is Near", a: "Sipho Mbeki & Grace Cho", y: 2025, th: "Praise,Hope", k: "Bb", bpm: 126, lang: "English", scr: "Philippians 4:5", lic: "WC", cong: 0 },
  { t: "Morning Will Come", a: "Jonah Park", y: 2022, th: "Comfort,Hope", k: "C", bpm: 74, lang: "English", scr: "Psalm 30:5", lic: "WC", cong: 0 },
  { t: "Slow to Anger", a: "Rei Nakamura", y: 2024, th: "Confession,Grace", k: "Em", bpm: 60, lang: "English", scr: "Psalm 103:8", lic: "WC", cong: 0 },
  { t: "Todo Valle", a: "Miriam Okafor · tr. Carla Reyes", y: 2024, th: "Advent,Comfort", k: "D", bpm: 72, lang: "Spanish", scr: "Isaías 40:4", lic: "WC", cong: 0, parent: "Every Valley", rel: "Spanish translation · tr. Carla Reyes, 2024" },
  { t: "Tunakuabudu", a: "Esther Wanjiru", y: 2023, th: "Praise,Adoration", k: "F", bpm: 96, lang: "Swahili", scr: "Zaburi 95", lic: "WC", cong: 0 },
  { t: "House of Bread", a: "Lena Whitfield", y: 2021, th: "Christmas,Advent", k: "F", bpm: 80, lang: "English", scr: "Micah 5:2", lic: "WC", cong: 0 },
  { t: "Rise Up, O Sleeper", a: "Daniel Antwi", y: 2023, th: "Easter,Praise", k: "A", bpm: 118, lang: "English", scr: "Ephesians 5:14", lic: "WC", cong: 0 },
  { t: "Table Wide as Mercy", a: "Hanna Lindqvist", y: 2025, th: "Communion,Grace", k: "C", bpm: 62, lang: "English", scr: "Isaiah 25:6", lic: "WC", cong: 0 },
  { t: "Watchman's Song (How Long)", a: "Priya Iyer", y: 2022, th: "Lament,Justice", k: "Am", bpm: 70, lang: "English", scr: "Habakkuk 1:2", lic: "WC", cong: 0 },
  { t: "God With Us Still", a: "Kwame Osei", y: 2024, th: "Christmas,Advent", k: "G", bpm: 78, lang: "English", scr: "Matthew 1:23", lic: "WC", cong: 0 },
  { t: "Sower's Song", a: "Nikolai Petrov", y: 2023, th: "Mission,Provision", k: "E", bpm: 104, lang: "English", scr: "Matthew 13:3", lic: "WC", cong: 0 }
];

export interface CatalogFile { songId: string; src: string; key: string; }

// Demo audio and stems come from real uploads only; melody MIDIs are real,
// PD-verified Open Hymnal files (see tools/import-openhymnal.ts).
export function buildCatalog(contentRoot: string) {
  const defs: any[] = [...SONGS, ...HYMNS, ...HYMNS2, ...HYMNS_OH];
  const rows: any[] = [];
  const files: CatalogFile[] = [];
  const seen = new Set<string>();

  defs.forEach(s => {
    const id = idFor(s.t);
    if (seen.has(id)) throw new Error(`Duplicate seed title/id: ${s.t}`);
    seen.add(id);

    const row: any = {
      id,
      title: s.t,
      writer: s.a,
      year: s.y,
      themes: s.th,
      songKey: s.k,
      bpm: s.bpm,
      timeSignature: s.ts || "4/4",
      language: s.lang,
      scripture: s.scr,
      scriptureText: s.scrText || null,
      license: s.lic,
      churchCount: s.cong,
      chordPro: s.chordPro || HYMN_TEXTS[s.t] || stubChordPro(s.k),
      parentSongId: s.parent ? idFor(s.parent) : null,
      relationLabel: s.rel || null,
      status: "approved",
      certified: true
    };

    const midi = MIDI[s.t];
    row.midiUrl = midi ? `${contentRoot}/songs/${id}/tune.mid` : null;
    row.midiBytes = midi ? midi.bytes : null;
    if (midi) files.push({ songId: id, src: `midi/${midi.file}`, key: `songs/${id}/tune.mid` });

    const lyr = LYRIC_MAP[s.t];
    row.lyricsUrl = lyr ? `${contentRoot}/songs/${id}/lyrics.json` : null;
    if (lyr) files.push({ songId: id, src: `lyrics/${lyr.file}`, key: `songs/${id}/lyrics.json` });
    rows.push(row);
  });

  return { rows, files };
}
