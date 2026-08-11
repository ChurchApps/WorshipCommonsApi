import { getDb } from "../db";
import { Admin } from "../models";

export class AdminRepo {
  public async load(userId: string): Promise<Admin | undefined> {
    if (!userId) return undefined;
    return await getDb().selectFrom("admins").selectAll().where("userId", "=", userId).executeTakeFirst() as Admin | undefined;
  }

  // first-signed-in-user-wins bootstrap for fresh environments
  public async bootstrap(userId: string, email: string): Promise<boolean> {
    const any = await getDb().selectFrom("admins").select("userId").executeTakeFirst();
    if (!any) {
      await getDb().insertInto("admins").values({ userId, email }).execute();
      return true;
    }
    return !!(await this.load(userId));
  }
}
