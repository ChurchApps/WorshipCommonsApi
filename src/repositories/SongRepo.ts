import { UniqueIdHelper } from "@churchapps/apihelper";
import { sql } from "kysely";
import { getDb } from "../db";
import { Song } from "../models";

const SUMMARY_COLS = [
  "id",
  "title",
  "writer",
  "year",
  "themes",
  "songKey",
  "bpm",
  "timeSignature",
  "language",
  "scripture",
  "license",
  "churchCount",
  "hymnalCount",
  "demoAudioUrl",
  "demoAudioBytes",
  "sheetPdfUrl",
  "sheetPdfBytes",
  "stemsZipUrl",
  "stemsZipBytes",
  "midiUrl",
  "midiBytes",
  "lyricsUrl",
  "abcUrl",
  "parentSongId",
  "relationLabel",
  "qualityScore",
  "artUrl"
] as const;

export class SongRepo {
  // list payload omits chordPro (heavy) and moderation-only fields
  public async loadApprovedSummaries(): Promise<Song[]> {
    return await getDb().selectFrom("songs").select(SUMMARY_COLS).where("status", "=", "approved").orderBy("churchCount", "desc").orderBy("hymnalCount", "desc").execute() as Song[];
  }

  public async loadBySubmitter(submittedBy: string): Promise<Song[]> {
    return await getDb().selectFrom("songs").select([...SUMMARY_COLS, "status", "createdAt"])
      .where("submittedBy", "=", submittedBy).orderBy("createdAt", "desc").execute() as Song[];
  }

  public async loadPending(): Promise<Song[]> {
    return await getDb().selectFrom("songs").selectAll().where("status", "=", "pending")
      .orderBy(sql`qualityScore is null`).orderBy("qualityScore", "desc").orderBy("createdAt", "asc").execute() as Song[];
  }

  public async loadUnscored(limit: number): Promise<Song[]> {
    return await getDb().selectFrom("songs").selectAll()
      .where("qualityScore", "is", null).where("status", "!=", "removed").limit(limit).execute() as Song[];
  }

  public async loadById(id: string): Promise<Song | undefined> {
    return await getDb().selectFrom("songs").selectAll().where("id", "=", id).executeTakeFirst() as Song | undefined;
  }

  public async create(song: Song): Promise<Song> {
    song.id = UniqueIdHelper.shortId();
    await getDb().insertInto("songs").values({
      id: song.id,
      title: song.title,
      writer: song.writer,
      year: song.year,
      themes: song.themes,
      songKey: song.songKey,
      bpm: song.bpm,
      timeSignature: song.timeSignature,
      language: song.language,
      scripture: song.scripture,
      scriptureText: song.scriptureText,
      license: song.license,
      churchCount: song.churchCount || 0,
      chordPro: song.chordPro,
      demoAudioUrl: song.demoAudioUrl,
      demoAudioBytes: song.demoAudioBytes,
      sheetPdfUrl: song.sheetPdfUrl,
      sheetPdfBytes: song.sheetPdfBytes,
      stemsZipUrl: song.stemsZipUrl,
      stemsZipBytes: song.stemsZipBytes,
      midiUrl: song.midiUrl,
      midiBytes: song.midiBytes,
      lyricsUrl: song.lyricsUrl,
      abcUrl: song.abcUrl,
      parentSongId: song.parentSongId,
      relationLabel: song.relationLabel,
      status: song.status || "pending",
      submittedBy: song.submittedBy,
      proAnswer: song.proAnswer,
      certified: song.certified,
      qualityScore: song.qualityScore,
      qualityDetail: song.qualityDetail
    }).execute();
    return song;
  }

  public async update(id: string, fields: Partial<Song>): Promise<void> {
    await getDb().updateTable("songs").set({ ...fields, updatedAt: new Date() }).where("id", "=", id).execute();
  }

  public async recordSing(songId: string, ipHash: string): Promise<boolean> {
    const result = await getDb().insertInto("sings").ignore().values({ songId, ipHash }).executeTakeFirst();
    return Number(result.numInsertedOrUpdatedRows || 0) > 0;
  }

  public async loadLibraryIds(userId: string): Promise<string[]> {
    const rows = await getDb().selectFrom("libraries").select("songId").where("userId", "=", userId).orderBy("createdAt", "desc").execute();
    return rows.map(r => r.songId as string);
  }

  public async addToLibrary(userId: string, songId: string): Promise<boolean> {
    const result = await getDb().insertInto("libraries").ignore().values({ userId, songId }).executeTakeFirst();
    return Number(result.numInsertedOrUpdatedRows || 0) > 0;
  }

  public async removeFromLibrary(userId: string, songId: string): Promise<void> {
    await getDb().deleteFrom("libraries").where("userId", "=", userId).where("songId", "=", songId).execute();
  }

  public async incrementChurchCount(id: string): Promise<number> {
    await getDb().updateTable("songs").set(eb => ({ churchCount: eb("churchCount", "+", 1) })).where("id", "=", id).execute();
    const row = await this.loadById(id);
    return row?.churchCount || 0;
  }
}
