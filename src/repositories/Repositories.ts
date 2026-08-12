import { SongRepo } from "./SongRepo";
import { ReportRepo } from "./ReportRepo";
import { AdminRepo } from "./AdminRepo";
import { AbcSubmissionRepo } from "./AbcSubmissionRepo";

export class Repositories {
  public song: SongRepo;
  public report: ReportRepo;
  public admin: AdminRepo;
  public abcSubmission: AbcSubmissionRepo;

  private static _current: Repositories | null = null;
  public static getCurrent = () => {
    if (Repositories._current === null) Repositories._current = new Repositories();
    return Repositories._current;
  };

  constructor() {
    this.song = new SongRepo();
    this.report = new ReportRepo();
    this.admin = new AdminRepo();
    this.abcSubmission = new AbcSubmissionRepo();
  }
}
