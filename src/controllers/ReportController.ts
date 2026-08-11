import { controller, httpPost } from "inversify-express-utils";
import express from "express";
import { WorshipCommonsBaseController } from "./WorshipCommonsBaseController";
import { Report } from "../models";

@controller("/reports")
export class ReportController extends WorshipCommonsBaseController {
  @httpPost("/")
  public async create(req: express.Request<{}, {}, Report>, res: express.Response): Promise<any> {
    return this.actionWrapperAnon(req, res, async () => {
      const b = req.body;
      if (!b.songText || !b.details || !b.name || !b.email || !b.signature) return this.json({ errors: ["All fields are required"] }, 400);
      const report = await this.repositories.report.create({
        songText: b.songText,
        songId: b.songId,
        reporterRole: b.reporterRole,
        details: b.details,
        name: b.name,
        email: b.email,
        signature: b.signature
      });
      return { id: report.id };
    });
  }
}
