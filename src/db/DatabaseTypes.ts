import { Song, Report, Admin, Sing, LibrarySong } from "../models";

export interface Database {
  songs: Song;
  reports: Report;
  admins: Admin;
  sings: Sing;
  libraries: LibrarySong;
}
