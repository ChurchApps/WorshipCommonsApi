import { AwsHelper, EnvironmentBase } from "@churchapps/apihelper";

export class Environment extends EnvironmentBase {
  static webUrl: string;
  static openAiApiKey: string;

  static async init(environment: string) {
    const data = await this.initBase(environment, { appName: "worshipCommonsApi" });
    this.contentRoot = process.env.CONTENT_ROOT || this.contentRoot;
    this.webUrl = data.webUrl;
    this.openAiApiKey = process.env.OPENAI_API_KEY || (await AwsHelper.readParameter(`/${environment}/openAIKey`));
  }
}
