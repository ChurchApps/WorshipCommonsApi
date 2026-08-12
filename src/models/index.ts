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
  hymnalCount?: number;
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
  abcUrl?: string;
  videoUrl?: string;
  writerPortraitUrl?: string;
  writerBio?: string;
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

export interface AbcSubmission {
  id?: string;
  songId?: string;
  abc?: string;
  submittedBy?: string;
  status?: string;
  createdAt?: Date;
}

export interface Admin {
  userId?: string;
  email?: string;
  createdAt?: Date;
}

export interface Sing {
  songId?: string;
  ipHash?: string;
  createdAt?: Date;
}

export interface LibrarySong {
  userId?: string;
  songId?: string;
  createdAt?: Date;
}
