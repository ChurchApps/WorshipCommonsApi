import { Song, Report, Admin } from "../models";

export interface Database {
  songs: Song;
  reports: Report;
  admins: Admin;
}
