import { Song, Report, Admin, Sing, LibrarySong, AbcSubmission } from "../models";

export interface Database {
  songs: Song;
  reports: Report;
  admins: Admin;
  sings: Sing;
  libraries: LibrarySong;
  abcSubmissions: AbcSubmission;
}
