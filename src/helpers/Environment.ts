import { EnvironmentBase } from "@churchapps/apihelper";

export class Environment extends EnvironmentBase {
  static webUrl: string;

  static async init(environment: string) {
    const data = await this.initBase(environment, { appName: "worshipCommonsApi" });
    this.contentRoot = process.env.CONTENT_ROOT || this.contentRoot;
    this.webUrl = data.webUrl;
  }
}
