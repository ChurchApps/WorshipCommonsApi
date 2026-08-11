import { CustomBaseController } from "@churchapps/apihelper";
import { Repositories } from "../repositories";

export class WorshipCommonsBaseController extends CustomBaseController {
  public repositories: Repositories;

  constructor() {
    super();
    this.repositories = Repositories.getCurrent();
  }

  public async isAdmin(userId: string): Promise<boolean> {
    if (!userId) return false;
    return !!(await this.repositories.admin.load(userId));
  }
}
