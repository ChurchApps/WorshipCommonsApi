export interface Song {
  id?: string;
  title?: string;
  writer?: string;
  year?: number;
  themes?: string;
  songKey?: string;
  bpm?: number;
  timeSignature?: string;
  language?: string;
  scripture?: string;
  scriptureText?: string;
  license?: string;
  churchCount?: number;
  chordPro?: string;
  demoAudioUrl?: string;
  demoAudioBytes?: number;
  sheetPdfUrl?: string;
  sheetPdfBytes?: number;
  stemsZipUrl?: string;
  stemsZipBytes?: number;
  midiUrl?: string;
  midiBytes?: number;
  lyricsUrl?: string;
  parentSongId?: string;
  relationLabel?: string;
  status?: string;
  submittedBy?: string;
  proAnswer?: string;
  certified?: boolean;
  qualityScore?: number;
  qualityDetail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Report {
  id?: string;
  songText?: string;
  songId?: string;
  reporterRole?: string;
  details?: string;
  name?: string;
  email?: string;
  signature?: string;
  status?: string;
  createdAt?: Date;
}

export interface Admin {
  userId?: string;
  email?: string;
  createdAt?: Date;
}
