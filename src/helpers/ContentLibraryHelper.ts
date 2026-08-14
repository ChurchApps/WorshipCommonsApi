import { FileStorageHelper } from "@churchapps/apihelper";
import { Song } from "../models";

// The content bucket mirrors the WorshipCommonsContent repo layout. Submitted
// songs get a library-shaped folder written at submit/approve time so the
// periodic bucket→repo export (aws s3 sync) yields valid library folders and
// the DB row can be rebuilt from them. Conventions here (slugify, chordpro
// header) must match WorshipCommonsContent/tools/lib.mjs.

const LANG_CODES: Record<string, string> = {
  English: "en",
  German: "de",
  Spanish: "es",
  Latin: "la",
  French: "fr",
  Portuguese: "pt",
  Russian: "ru",
  Malayalam: "ml",
  Albanian: "sq",
  Hungarian: "hu",
  Zulu: "zu"
};

const UPLOAD_COLS: [string, keyof Song][] = [["demoAudio", "demoAudioUrl"], ["sheetPdf", "sheetPdfUrl"], ["stemsZip", "stemsZipUrl"]];

export class ContentLibraryHelper {
  // matches lib.mjs slugify — cosmetic only, identity is the song id
  static slugify(title: string): string {
    return title.normalize("NFC").toLowerCase()
      .replace(/['’ʼ]/gu, "")
      .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "untitled";
  }

  // submissions get "<slug>--<id>" folders — unique without a bucket lookup.
  // ponytail: recomputed from the row (no stored path) — safe while titles are
  // immutable; a future edit endpoint must store the path or rename the folder.
  static folderKey(song: Song): string {
    const lang = LANG_CODES[song.language || ""] || "en";
    const section = song.license === "PD" ? "public-domain" : "wc-license";
    return `songs/${lang}/${section}/${this.slugify(song.title || "")}--${song.id}`;
  }

  // library-shaped song.json — what tools/build-catalog.mjs reads on export
  static songJson(song: Song): object {
    const uploads: Record<string, string> = {};
    for (const [field, urlCol] of UPLOAD_COLS) {
      const url = song[urlCol] as string | undefined;
      if (url) uploads[field] = url.split("/").pop() as string;
    }
    return {
      id: song.id,
      title: song.title,
      writer: song.writer,
      year: song.year,
      themes: song.themes,
      key: song.songKey,
      bpm: song.bpm,
      timeSignature: song.timeSignature,
      language: song.language,
      scripture: song.scripture,
      license: song.license,
      churchCount: song.churchCount ?? 0,
      hymnalCount: song.hymnalCount ?? 0,
      status: song.status,
      submittedBy: song.submittedBy,
      proAnswer: song.proAnswer,
      certified: true,
      uploads: Object.keys(uploads).length ? uploads : undefined
    };
  }

  // matches lib.mjs renderChordpro — header must agree with song.json (validate.mjs checks)
  static renderChordpro(song: Song): string {
    const lines: string[] = [];
    const d = (name: string, v: unknown) => { if (v !== null && v !== undefined && v !== "") lines.push(`{${name}: ${v}}`); };
    d("title", song.title);
    d("artist", song.writer);
    d("key", song.songKey);
    d("time", song.timeSignature);
    d("tempo", song.bpm);
    return lines.join("\n") + "\n\n" + song.chordPro + "\n";
  }

  // (re)writes the song's folder metadata in the bucket — idempotent, call after any row change
  static async writeSongFolder(song: Song): Promise<void> {
    const folder = this.folderKey(song);
    await FileStorageHelper.store(`${folder}/song.json`, "application/json", Buffer.from(JSON.stringify(this.songJson(song), null, 2) + "\n"));
    await FileStorageHelper.store(`${folder}/lyrics.chordpro`, "text/plain; charset=utf-8", Buffer.from(this.renderChordpro(song)));
  }
}
