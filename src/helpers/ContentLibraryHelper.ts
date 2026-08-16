import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { FileStorageHelper } from "@churchapps/apihelper";
import { GetObjectCommand, PutObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Environment } from "./Environment";
import { Song } from "../models";

// The content bucket mirrors the WorshipCommonsContent repo layout. Approved
// songs get a library-shaped folder so the periodic bucket→repo export
// (aws s3 sync) yields valid library folders and the DB row can be rebuilt
// from them. Conventions here (slugify, chordpro header) must match
// WorshipCommonsContent/tools/lib.mjs.

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
const REVIEW_TTL_SEC = 7200;

export class ContentLibraryHelper {
  private static s3: S3Client;

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

  static pendingFolderKey(song: Song): string {
    return `pending/${song.id}`;
  }

  static storageKey(url?: string): string | undefined {
    if (!url) return undefined;
    if (url.startsWith("pending/")) return url;
    const root = Environment.contentRoot;
    if (root && url.startsWith(root + "/")) return url.slice(root.length + 1);
    return undefined;
  }

  static isPendingKey(key?: string): boolean {
    return !!key && key.startsWith("pending/");
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

  static async writeSongFolder(song: Song): Promise<void> {
    const folder = this.folderKey(song);
    await FileStorageHelper.store(`${folder}/song.json`, "application/json", Buffer.from(JSON.stringify(this.songJson(song), null, 2) + "\n"));
    await FileStorageHelper.store(`${folder}/lyrics.chordpro`, "text/plain; charset=utf-8", Buffer.from(this.renderChordpro(song)));
  }

  static async storePending(key: string, contentType: string, contents: Buffer): Promise<void> {
    if (Environment.fileStore === "S3") {
      await this.s3Client().send(new PutObjectCommand({ Bucket: Environment.s3Bucket, Key: key, Body: contents, ACL: "private", ContentType: contentType }));
      return;
    }
    const fileName = path.join(this.privateRoot(), key);
    fs.mkdirSync(path.dirname(fileName), { recursive: true });
    fs.writeFileSync(fileName, contents);
    fs.writeFileSync(fileName + ".ctype", contentType);
  }

  static async publishSong(song: Song): Promise<Partial<Song>> {
    const updates: Partial<Song> = {};
    const folder = this.folderKey(song);
    for (const [, urlCol] of UPLOAD_COLS) {
      const key = this.storageKey(song[urlCol] as string | undefined);
      if (!this.isPendingKey(key)) continue;
      const file = await this.readKey(key);
      if (!file) continue;
      const dest = `${folder}/${key.split("/").pop()}`;
      await FileStorageHelper.store(dest, file.contentType, file.buffer);
      await this.removeKey(key, "pending");
      (updates as any)[urlCol] = `${Environment.contentRoot}/${dest}`;
    }
    await this.writeSongFolder({ ...song, ...updates });
    await this.removePrefix(this.pendingFolderKey(song), "pending");
    return updates;
  }

  static async removeSongObjects(song: Song): Promise<void> {
    await this.removePrefix(this.pendingFolderKey(song), "pending");
    await this.removePrefix(this.folderKey(song), "public");
    for (const [, urlCol] of UPLOAD_COLS) {
      const key = this.storageKey(song[urlCol] as string | undefined);
      if (key) await this.removeKey(key, this.isPendingKey(key) ? "pending" : "public");
    }
  }

  static async withReviewUrls(song: Song, apiBase: string): Promise<Song> {
    const exp = Math.floor(Date.now() / 1000) + REVIEW_TTL_SEC;
    const out = { ...song };
    for (const [field, urlCol] of UPLOAD_COLS) {
      const key = this.storageKey(song[urlCol] as string | undefined);
      if (!this.isPendingKey(key) || !song.id) continue;
      if (Environment.fileStore === "S3") (out as any)[urlCol] = await getSignedUrl(this.s3Client(), new GetObjectCommand({ Bucket: Environment.s3Bucket, Key: key }), { expiresIn: REVIEW_TTL_SEC });
      else (out as any)[urlCol] = `${apiBase.replace(/\/$/, "")}/admin/pending-files/${song.id}/${field}?exp=${exp}&sig=${this.signPendingFile(song.id, field, exp)}`;
    }
    return out;
  }

  static signPendingFile(songId: string, field: string, exp: number): string {
    return crypto.createHmac("sha256", Environment.jwtSecret || "").update(`${songId}:${field}:${exp}`).digest("hex");
  }

  static verifyPendingFile(songId: string, field: string, exp: number, sig: string): boolean {
    if (!songId || !field || !sig || !Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
    const expected = this.signPendingFile(songId, field, exp);
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  static async readPendingField(song: Song, field: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    const col = UPLOAD_COLS.find(([f]) => f === field)?.[1];
    if (!col) return null;
    const key = this.storageKey(song[col] as string | undefined);
    if (!this.isPendingKey(key)) return null;
    return await this.readKey(key);
  }

  static requestApiBase(req: { protocol?: string; get?: (n: string) => string | undefined; headers: Record<string, unknown> }): string {
    const xfProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
    const xfHost = String(req.headers["x-forwarded-host"] || "").split(",")[0].trim();
    return `${xfProto || req.protocol || "https"}://${xfHost || req.get?.("host") || ""}`;
  }

  private static s3Client(): S3Client {
    if (!this.s3) {
      const config: S3ClientConfig = {};
      if (process.env.S3_ENDPOINT) {
        config.endpoint = process.env.S3_ENDPOINT;
        config.forcePathStyle = true;
      }
      this.s3 = new S3Client(config);
    }
    return this.s3;
  }

  private static privateRoot(): string { return path.resolve("./private-content"); }

  private static async readKey(key: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    if (Environment.fileStore === "S3") {
      try {
        const res = await this.s3Client().send(new GetObjectCommand({ Bucket: Environment.s3Bucket, Key: key }));
        const bytes = await res.Body?.transformToByteArray();
        if (!bytes) return null;
        return { buffer: Buffer.from(bytes), contentType: res.ContentType || this.contentTypeFor(key) };
      } catch { return null; }
    }
    const fileName = path.join(this.privateRoot(), key);
    if (!fs.existsSync(fileName)) return null;
    const ctype = fs.existsSync(fileName + ".ctype") ? fs.readFileSync(fileName + ".ctype", "utf8").trim() : this.contentTypeFor(key);
    return { buffer: fs.readFileSync(fileName), contentType: ctype };
  }

  private static async removeKey(key: string, store: "pending" | "public"): Promise<void> {
    try {
      if (Environment.fileStore === "S3" || store === "public") await FileStorageHelper.remove(key);
      else {
        const fileName = path.join(this.privateRoot(), key);
        if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
        if (fs.existsSync(fileName + ".ctype")) fs.unlinkSync(fileName + ".ctype");
      }
    } catch { /* already gone */ }
  }

  private static async removePrefix(prefix: string, store: "pending" | "public"): Promise<void> {
    for (const key of await this.listKeys(prefix, store)) await this.removeKey(key, store);
  }

  private static async listKeys(prefix: string, store: "pending" | "public"): Promise<string[]> {
    const normalized = prefix.replace(/\/$/, "");
    if (Environment.fileStore === "S3") {
      try { return (await FileStorageHelper.list(normalized)).filter(Boolean); } catch { return []; }
    }
    if (store === "public") {
      try {
        const names = await FileStorageHelper.list(normalized);
        return names.map(n => n.includes("/") ? n : `${normalized}/${n}`);
      } catch { return []; }
    }
    const dir = path.join(this.privateRoot(), normalized);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(n => !n.endsWith(".ctype")).map(n => `${normalized}/${n}`);
  }

  private static contentTypeFor(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "mp3") return "audio/mpeg";
    if (ext === "wav") return "audio/wav";
    if (ext === "pdf") return "application/pdf";
    if (ext === "zip") return "application/zip";
    return "application/octet-stream";
  }
}
