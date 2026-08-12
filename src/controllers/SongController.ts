import { controller, httpDelete, httpGet, httpPost } from "inversify-express-utils";
import express from "express";
import * as crypto from "crypto";
import { FileStorageHelper } from "@churchapps/apihelper";
import { WorshipCommonsBaseController } from "./WorshipCommonsBaseController";
import { ChordProHelper } from "../helpers/ChordProHelper";
import { QualityHelper } from "../helpers/QualityHelper";
import { Environment } from "../helpers/Environment";
import { Song } from "../models";

interface UploadedFile { name: string; contentType: string; base64: string; }
interface SongSubmission extends Song {
  files?: { demoAudio?: UploadedFile; sheetPdf?: UploadedFile; stemsZip?: UploadedFile };
}

const MAX_FILE_BYTES = 26214400;

@controller("/songs")
export class SongController extends WorshipCommonsBaseController {
  @httpGet("/")
  public async getAll(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapperAnon(req, res, async () => await this.repositories.song.loadApprovedSummaries());
  }

  @httpGet("/mine")
  public async mine(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.id) return this.json({ errors: ["Sign in required"] }, 401);
      return await this.repositories.song.loadBySubmitter(au.id);
    });
  }

  @httpGet("/library")
  public async library(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.id) return this.json({ errors: ["Sign in required"] }, 401);
      return await this.repositories.song.loadLibraryIds(au.id);
    });
  }

  @httpPost("/:id/library")
  public async addToLibrary(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.id) return this.json({ errors: ["Sign in required"] }, 401);
      const song = await this.repositories.song.loadById(String(req.params.id));
      if (!song || song.status !== "approved") return this.json({}, 404);
      const added = await this.repositories.song.addToLibrary(au.id, song.id);
      // a save counts toward churchCount once per user and, like /sing, never decrements — removing it later doesn't unsing it
      const churchCount = added ? await this.repositories.song.incrementChurchCount(song.id) : song.churchCount;
      return { inLibrary: true, churchCount };
    });
  }

  @httpDelete("/:id/library")
  public async removeFromLibrary(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.id) return this.json({ errors: ["Sign in required"] }, 401);
      await this.repositories.song.removeFromLibrary(au.id, String(req.params.id));
      return { inLibrary: false };
    });
  }

  @httpGet("/:id")
  public async get(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapperAnon(req, res, async () => {
      const song = await this.repositories.song.loadById(String(req.params.id));
      if (!song || song.status !== "approved") return this.json({}, 404);
      const { proAnswer, qualityDetail, submittedBy, ...pub } = song as any;
      return pub;
    });
  }

  @httpGet("/:id/chordpro")
  public async chordpro(req: express.Request, res: express.Response): Promise<any> {
    return this.download(req, res, "cho", ChordProHelper.toCho);
  }

  @httpGet("/:id/lyrics")
  public async lyrics(req: express.Request, res: express.Response): Promise<any> {
    return this.download(req, res, "txt", ChordProHelper.toLyrics);
  }

  @httpPost("/:id/sing")
  public async sing(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapperAnon(req, res, async () => {
      const song = await this.repositories.song.loadById(String(req.params.id));
      if (!song || song.status !== "approved") return this.json({}, 404);
      // ponytail: IP-hash dedupe — NAT'd churches share an IP, so this undercounts slightly; fine for an honesty-first metric
      const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
      const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
      const counted = await this.repositories.song.recordSing(song.id, ipHash);
      const churchCount = counted ? await this.repositories.song.incrementChurchCount(song.id) : song.churchCount;
      return { churchCount };
    });
  }

  @httpPost("/")
  public async submit(req: express.Request<{}, {}, SongSubmission>, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.id) return this.json({ errors: ["Sign in to share a song"] }, 401);
      const body = req.body;
      if (!body.title || !body.chordPro || !body.certified) return this.json({ errors: ["title, chordPro and certification are required"] }, 400);

      const song: Song = {
        title: body.title,
        writer: body.writer,
        year: body.year,
        themes: body.themes,
        songKey: body.songKey,
        bpm: body.bpm,
        timeSignature: body.timeSignature || "4/4",
        language: body.language || "English",
        scripture: body.scripture,
        license: body.license === "PD" ? "PD" : "WC",
        chordPro: body.chordPro,
        status: "pending",
        submittedBy: au.id,
        proAnswer: body.proAnswer,
        certified: true
      };
      await this.repositories.song.create(song);

      const files: { field: string; file?: UploadedFile; urlCol: keyof Song; bytesCol: keyof Song }[] = [
        { field: "demoAudio", file: body.files?.demoAudio, urlCol: "demoAudioUrl", bytesCol: "demoAudioBytes" },
        { field: "sheetPdf", file: body.files?.sheetPdf, urlCol: "sheetPdfUrl", bytesCol: "sheetPdfBytes" },
        { field: "stemsZip", file: body.files?.stemsZip, urlCol: "stemsZipUrl", bytesCol: "stemsZipBytes" }
      ];
      const updates: Partial<Song> = {};
      for (const f of files) {
        if (!f.file?.base64) continue;
        const buffer = Buffer.from(f.file.base64, "base64");
        if (buffer.length === 0 || buffer.length > MAX_FILE_BYTES) continue;
        const safeName = (f.file.name || f.field).replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `songs/${song.id}/${safeName}`;
        await FileStorageHelper.store(key, f.file.contentType || "application/octet-stream", buffer);
        (updates as any)[f.urlCol] = `${Environment.contentRoot}/${key}`;
        (updates as any)[f.bytesCol] = buffer.length;
      }
      if (Object.keys(updates).length > 0) await this.repositories.song.update(song.id, updates);

      // must await: Lambda freezes after the response, fire-and-forget never completes
      const scoreFields = await QualityHelper.score({ ...song, ...updates });
      if (scoreFields.qualityScore != null) await this.repositories.song.update(song.id, scoreFields);

      return { ...song, ...updates, ...scoreFields };
    });
  }

  private async download(req: express.Request, res: express.Response, ext: string, convert: (song: Song) => string): Promise<any> {
    const song = await this.repositories.song.loadById(String(req.params.id));
    if (!song || song.status !== "approved") {
      res.status(404).json({});
      return;
    }
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${ChordProHelper.slug(song.title)}.${ext}"`);
    res.send(convert(song));
  }
}
