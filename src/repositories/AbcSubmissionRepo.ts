import { UniqueIdHelper } from "@churchapps/apihelper";
import { getDb } from "../db";
import { AbcSubmission } from "../models";

export class AbcSubmissionRepo {
  public async create(sub: AbcSubmission): Promise<AbcSubmission> {
    sub.id = UniqueIdHelper.shortId();
    await getDb().insertInto("abcSubmissions").values({
      id: sub.id,
      songId: sub.songId,
      abc: sub.abc,
      submittedBy: sub.submittedBy,
      status: "pending"
    }).execute();
    return sub;
  }

  public async loadPending(): Promise<(AbcSubmission & { songTitle: string })[]> {
    return await getDb()
      .selectFrom("abcSubmissions")
      .innerJoin("songs", "songs.id", "abcSubmissions.songId")
      .select(["abcSubmissions.id", "abcSubmissions.songId", "abcSubmissions.abc", "abcSubmissions.submittedBy", "abcSubmissions.createdAt", "songs.title as songTitle"])
      .where("abcSubmissions.status", "=", "pending")
      .orderBy("abcSubmissions.createdAt", "asc")
      .execute() as (AbcSubmission & { songTitle: string })[];
  }

  public async updateStatus(id: string, status: string): Promise<void> {
    await getDb().updateTable("abcSubmissions").set({ status }).where("id", "=", id).execute();
  }
}
