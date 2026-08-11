import { controller, httpGet, httpPost } from "inversify-express-utils";
import express from "express";
import { WorshipCommonsBaseController } from "./WorshipCommonsBaseController";
import { MigrationHelper } from "../helpers/MigrationHelper";
import { QualityHelper } from "../helpers/QualityHelper";

@controller("/admin")
export class AdminController extends WorshipCommonsBaseController {
  @httpPost("/migrate")
  public async migrate(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.id) return this.json({}, 401);
      return { applied: await MigrationHelper.migrateToLatest() };
    });
  }

  @httpPost("/bootstrap")
  public async bootstrap(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.id) return this.json({}, 401);
      return { admin: await this.repositories.admin.bootstrap(au.id, au.email) };
    });
  }

  @httpGet("/songs")
  public async pendingSongs(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!(await this.isAdmin(au.id))) return this.json({}, 401);
      return await this.repositories.song.loadPending();
    });
  }

  @httpGet("/reports")
  public async openReports(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!(await this.isAdmin(au.id))) return this.json({}, 401);
      return await this.repositories.report.loadOpen();
    });
  }

  @httpPost("/songs/:id/approve")
  public async approve(req: express.Request, res: express.Response): Promise<any> {
    return this.setSongStatus(req, res, "approved");
  }

  @httpPost("/songs/:id/reject")
  public async reject(req: express.Request, res: express.Response): Promise<any> {
    return this.setSongStatus(req, res, "removed");
  }

  @httpPost("/score-missing")
  public async scoreMissing(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!(await this.isAdmin(au.id))) return this.json({}, 401);
      // ponytail: 8 per call fits the 30s Lambda; caller loops until remaining is 0
      const songs = await this.repositories.song.loadUnscored(8);
      let scored = 0;
      for (const s of songs) {
        const fields = await QualityHelper.score(s);
        if (fields.qualityScore != null) {
          await this.repositories.song.update(s.id, fields);
          scored++;
        }
      }
      return { scored, remaining: (await this.repositories.song.loadUnscored(1)).length };
    });
  }

  @httpPost("/reports/:id/resolve")
  public async resolve(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapper(req, res, async (au) => {
      if (!(await this.isAdmin(au.id))) return this.json({}, 401);
      await this.repositories.report.updateStatus(String(req.params.id), "resolved");
      return { status: "resolved" };
    });
  }

  private setSongStatus(req: express.Request, res: express.Response, status: string) {
    return this.actionWrapper(req, res, async (au) => {
      if (!(await this.isAdmin(au.id))) return this.json({}, 401);
      const song = await this.repositories.song.loadById(String(req.params.id));
      if (!song) return this.json({}, 404);
      await this.repositories.song.update(song.id, { status });
      return { status };
    });
  }
}
