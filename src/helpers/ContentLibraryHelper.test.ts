import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { Environment } from "./Environment";
import { ContentLibraryHelper } from "./ContentLibraryHelper";
import { Song } from "../models";

Environment.fileStore = "disk";
Environment.contentRoot = "http://localhost:8098/content";
Environment.jwtSecret = "test-secret";

const song: Song = {
  id: "testpend001",
  title: "Pending Test Hymn",
  writer: "Tester",
  songKey: "G",
  timeSignature: "4/4",
  language: "English",
  license: "WC",
  chordPro: "Verse 1\n[G]Sing",
  status: "pending",
  submittedBy: "user0000001"
};

const pendingKey = `pending/${song.id}/tiny.wav`;
const publicDir = path.resolve("content", ContentLibraryHelper.folderKey(song));
const publicFile = path.join(publicDir, "tiny.wav");
const publicJson = path.join(publicDir, "song.json");
const publicLyrics = path.join(publicDir, "lyrics.chordpro");
const privateFile = path.resolve("private-content", pendingKey);

function clean() {
  for (const p of [privateFile, privateFile + ".ctype", publicFile, publicJson, publicLyrics]) {
    try { fs.unlinkSync(p); } catch { /* gone */ }
  }
}

afterEach(clean);

test("pending folder is not the public library path", () => {
  assert.equal(ContentLibraryHelper.pendingFolderKey(song), "pending/testpend001");
  assert.ok(!ContentLibraryHelper.folderKey(song).startsWith("pending/"));
  assert.ok(ContentLibraryHelper.folderKey(song).startsWith("songs/"));
  assert.ok(ContentLibraryHelper.isPendingKey(pendingKey));
  assert.ok(!ContentLibraryHelper.isPendingKey(ContentLibraryHelper.folderKey(song) + "/tiny.wav"));
});

test("submit stores files off the public content tree", async () => {
  await ContentLibraryHelper.storePending(pendingKey, "audio/wav", Buffer.from("RIFF....WAVEfmt"));
  assert.ok(fs.existsSync(privateFile));
  assert.ok(!fs.existsSync(publicFile));
  assert.ok(!fs.existsSync(path.resolve("content", pendingKey)));
});

test("review urls are signed API links, not public bucket paths", async () => {
  const reviewed = await ContentLibraryHelper.withReviewUrls({ ...song, demoAudioUrl: pendingKey }, "http://localhost:8098");
  assert.match(reviewed.demoAudioUrl || "", /^http:\/\/localhost:8098\/admin\/pending-files\/testpend001\/demoAudio\?exp=\d+&sig=[0-9a-f]+$/);
  assert.ok(!reviewed.demoAudioUrl?.includes("pending/testpend001/tiny.wav"));
  const u = new URL(reviewed.demoAudioUrl || "");
  assert.ok(ContentLibraryHelper.verifyPendingFile(song.id, "demoAudio", Number(u.searchParams.get("exp")), u.searchParams.get("sig") || ""));
  assert.ok(!ContentLibraryHelper.verifyPendingFile(song.id, "demoAudio", Number(u.searchParams.get("exp")), "deadbeef"));
});

test("approve publishes to the public library folder", async () => {
  await ContentLibraryHelper.storePending(pendingKey, "audio/wav", Buffer.from("RIFF....WAVEfmt"));
  const updates = await ContentLibraryHelper.publishSong({ ...song, status: "approved", demoAudioUrl: pendingKey });
  assert.equal(updates.demoAudioUrl, `${Environment.contentRoot}/${ContentLibraryHelper.folderKey(song)}/tiny.wav`);
  assert.ok(fs.existsSync(publicFile));
  assert.ok(fs.existsSync(publicJson));
  assert.ok(!fs.existsSync(privateFile));
  const json = JSON.parse(fs.readFileSync(publicJson, "utf8"));
  assert.equal(json.status, "approved");
  assert.equal(json.uploads.demoAudio, "tiny.wav");
});

test("reject removes pending and public objects", async () => {
  await ContentLibraryHelper.storePending(pendingKey, "audio/wav", Buffer.from("RIFF....WAVEfmt"));
  await ContentLibraryHelper.publishSong({ ...song, status: "approved", demoAudioUrl: pendingKey });
  await ContentLibraryHelper.removeSongObjects({ ...song, demoAudioUrl: `${Environment.contentRoot}/${ContentLibraryHelper.folderKey(song)}/tiny.wav` });
  assert.ok(!fs.existsSync(privateFile));
  assert.ok(!fs.existsSync(publicFile));
  assert.ok(!fs.existsSync(publicJson));
});
