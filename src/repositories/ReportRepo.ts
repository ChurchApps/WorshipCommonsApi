import { UniqueIdHelper } from "@churchapps/apihelper";
import { getDb } from "../db";
import { Report } from "../models";

export class ReportRepo {
  public async create(report: Report): Promise<Report> {
    report.id = UniqueIdHelper.shortId();
    await getDb().insertInto("reports").values({
      id: report.id,
      songText: report.songText,
      songId: report.songId,
      reporterRole: report.reporterRole,
      details: report.details,
      name: report.name,
      email: report.email,
      signature: report.signature,
      status: "open"
    }).execute();
    return report;
  }

  public async loadOpen(): Promise<Report[]> {
    return await getDb().selectFrom("reports").selectAll().where("status", "=", "open").orderBy("createdAt", "asc").execute() as Report[];
  }

  public async updateStatus(id: string, status: string): Promise<void> {
    await getDb().updateTable("reports").set({ status }).where("id", "=", id).execute();
  }
}
