import * as crypto from "crypto";
import { HYMNS, HYMN_TEXTS } from "./hymns.js";
import { HYMNS2 } from "./hymns2.js";
import { HYMNS_OH } from "./hymns-oh.js";
import { HYMNS_ES } from "./hymns-es.js";
import { HYMNS_ES_TCH } from "./hymns-es-tch.js";
import { HYMNS_ES_HYMNARY } from "./hymns-es-hymnary.js";
import { HYMNS_MODERN } from "./hymns-modern.js";
import { HYMNS_TCH_DE, MIDI_TCH_DE } from "./hymns-tch-de.js";
import { HYMNS_TCH_FR, MIDI_TCH_FR } from "./hymns-tch-fr.js";
import { HYMNS_TCH_PT, MIDI_TCH_PT } from "./hymns-tch-pt.js";
import { HYMNS_TCH_RU, MIDI_TCH_RU } from "./hymns-tch-ru.js";
import { HYMNS_TCH_ML, MIDI_TCH_ML } from "./hymns-tch-ml.js";
import { HYMNS_TCH_SQ, MIDI_TCH_SQ } from "./hymns-tch-sq.js";
import { HYMNS_TCH_HU, MIDI_TCH_HU } from "./hymns-tch-hu.js";
import { MIDI_MAP_ES } from "./midi-map-es.js";
import { MIDI_MAP } from "./midi-map.js";
import { MIDI_MAP_HYMNSITE } from "./midi-map-hymnsite.js";
import { MIDI_MAP_TCH } from "./midi-map-tch.js";
import { LYRIC_MAP } from "./lyric-map.js";
import { VERSE_EXPANSION } from "./verse-expansion.js";
import { WRITER_MAP } from "./writer-map.js";
import { VIDEO_MAP } from "./video-map.js";
import { HYMNAL_COUNT } from "./popularity-map.js";
import { ART_MAP } from "./art-map.js";

const MIDI: Record<string, { file: string; bytes: number }> = {
  ...MIDI_MAP_TCH,
  ...MIDI_MAP_HYMNSITE,
  ...MIDI_MAP,
  ...MIDI_MAP_ES,
  ...MIDI_TCH_DE,
  ...MIDI_TCH_FR,
  ...MIDI_TCH_PT,
  ...MIDI_TCH_RU,
  ...MIDI_TCH_ML,
  ...MIDI_TCH_SQ,
  ...MIDI_TCH_HU
};

// deterministic char(11) id in UniqueIdHelper.shortId's base64url format — stable across reseeds
export const idFor = (title: string) => crypto.createHash("sha1").update("wcsong:" + title).digest("base64url").slice(0, 11);

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

// curated PD hymns from the original mockup library (fictional WC demo songs removed 2026-08)
const SONGS = [
  { t: "Amazing Grace", a: "John Newton", y: 1779, th: "Grace,Assurance", k: "G", bpm: 84, ts: "3/4", lang: "English", scr: "John 9:25", lic: "PD", cong: 0, chordPro: AMAZING_GRACE },
  { t: "Be Thou My Vision", a: "Irish, 8th c. · tr. Byrne", y: 1905, th: "Trust,Adoration", k: "E", bpm: 76, ts: "3/4", lang: "English", scr: "Psalm 16:8", lic: "PD", cong: 0 },
  { t: "Holy, Holy, Holy", a: "Reginald Heber", y: 1826, th: "Adoration,Praise", k: "D", bpm: 92, lang: "English", scr: "Revelation 4:8", lic: "PD", cong: 0 },
  { t: "Come Thou Fount", a: "Robert Robinson", y: 1758, th: "Grace,Praise", k: "D", bpm: 88, ts: "3/4", lang: "English", scr: "1 Samuel 7:12", lic: "PD", cong: 0 },
  { t: "Doxology", a: "Thomas Ken", y: 1674, th: "Praise", k: "G", bpm: 76, lang: "English", scr: "Psalm 100", lic: "PD", cong: 0 },
  { t: "It Is Well with My Soul", a: "Horatio Spafford", y: 1873, th: "Comfort,Assurance", k: "C", bpm: 66, lang: "English", scr: "Psalm 46:1", lic: "PD", cong: 0 },
  { t: "All Creatures of Our God and King", a: "Francis of Assisi · tr. Draper", y: 1919, th: "Praise,Creation", k: "D", bpm: 100, ts: "6/4", lang: "English", scr: "Psalm 148", lic: "PD", cong: 0 },
  { t: "Ein feste Burg ist unser Gott", a: "Martin Luther", y: 1529, th: "Trust,Assurance", k: "C", bpm: 96, lang: "German", scr: "Psalm 46", lic: "PD", cong: 0, parent: "A Mighty Fortress Is Our God", rel: "German original · Martin Luther, 1529" }
];

export interface CatalogFile { songId: string; src: string; key: string; }

// Demo audio and stems come from real uploads only; melody MIDIs are real,
// PD-verified Open Hymnal files (see tools/import-openhymnal.ts).
export function buildCatalog(contentRoot: string) {
  const defs: any[] = [
    ...SONGS,
    ...HYMNS,
    ...HYMNS2,
    ...HYMNS_OH,
    ...HYMNS_ES,
    ...HYMNS_ES_TCH,
    ...HYMNS_ES_HYMNARY,
    ...HYMNS_MODERN,
    ...HYMNS_TCH_DE,
    ...HYMNS_TCH_FR,
    ...HYMNS_TCH_PT,
    ...HYMNS_TCH_RU,
    ...HYMNS_TCH_ML,
    ...HYMNS_TCH_SQ,
    ...HYMNS_TCH_HU
  ];
  const rows: any[] = [];
  const files: CatalogFile[] = [];
  const seen = new Set<string>();
  const writerSlugs = new Set<string>();

  defs.forEach(s => {
    const id = idFor(s.t);
    if (seen.has(id)) throw new Error(`Duplicate seed title/id: ${s.t}`);
    seen.add(id);
    if (!s.chordPro && !HYMN_TEXTS[s.t]) throw new Error(`No lyrics for seed song: ${s.t}`);

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
      hymnalCount: HYMNAL_COUNT[s.t] ?? 0,
      // original seed batches carried Verse 1 only — verse-expansion.ts appends the rest
      chordPro: [s.chordPro || HYMN_TEXTS[s.t], VERSE_EXPANSION[s.t]].filter(Boolean).join("\n\n"),
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

    // ABC engraving source exists only for Open Hymnal tunes (MIDI_MAP, not the merged MIDI)
    const abc = MIDI_MAP[s.t];
    row.abcUrl = abc ? `${contentRoot}/songs/${id}/tune.abc` : null;
    if (abc) files.push({ songId: id, src: `abc/${abc.file.replace(/\.mid$/, ".abc")}`, key: `songs/${id}/tune.abc` });

    const vid = VIDEO_MAP[s.t];
    row.videoUrl = vid ? `https://www.youtube.com/watch?v=${vid.id}` : null;

    const art = ART_MAP[s.t];
    row.artUrl = art ? `${contentRoot}/songs/${id}/art.webp` : null;
    if (art) files.push({ songId: id, src: `cover-art/${art.file}`, key: `songs/${id}/art.webp` });

    const wr = WRITER_MAP[s.a];
    row.writerPortraitUrl = wr ? `${contentRoot}/writers/${wr.slug}.jpg` : null;
    row.writerBio = wr ? wr.bio : null;
    if (wr && !writerSlugs.has(wr.slug)) {
      writerSlugs.add(wr.slug);
      files.push({ songId: id, src: `writers/${wr.slug}.jpg`, key: `writers/${wr.slug}.jpg` });
    }
    rows.push(row);
  });

  return { rows, files };
}
