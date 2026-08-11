import { controller, httpGet } from "inversify-express-utils";
import express from "express";
import { WorshipCommonsBaseController } from "./WorshipCommonsBaseController";
import { Environment } from "../helpers/Environment";

@controller("")
export class HealthController extends WorshipCommonsBaseController {
  @httpGet("/")
  public async health(req: express.Request, res: express.Response): Promise<any> {
    return this.actionWrapperAnon(req, res, async () => ({ status: "ok", name: "WorshipCommonsApi", environment: Environment.appEnv }));
  }
}
