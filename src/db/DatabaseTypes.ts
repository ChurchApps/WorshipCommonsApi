import { Song, Report, Admin, Sing } from "../models";

export interface Database {
  songs: Song;
  reports: Report;
  admins: Admin;
  sings: Sing;
}
