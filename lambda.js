import { configure } from "@codegenie/serverless-express";
import { init } from "./dist/App.js";
import { Environment } from "./dist/helpers/Environment.js";

let serverlessExpress;

const checkInit = async () => {
  if (!Environment.connectionString) {
    await Environment.init(process.env.APP_ENV);
  }
};

export const universal = async (event, context) => {
  try {
    await checkInit();

    if (!serverlessExpress) {
      const app = await init();
      serverlessExpress = configure({
        app,
        binarySettings: { contentTypes: ["application/octet-stream", "font/*", "image/*", "application/pdf", "audio/*", "application/zip"] },
        stripBasePath: false,
        resolutionMode: "PROMISE"
      });
    }

    return serverlessExpress(event, context);
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
      },
      body: JSON.stringify({ error: "Internal server error", message: error.message, timestamp: new Date().toISOString() })
    };
  }
};

// Prod's RDS is VPC-only, so migrations can't run from a laptop. This function sits in the
// same VPC and is IAM-invoked (no HTTP route, no JWT):
//   aws lambda invoke --region us-east-2 --function-name worshipcommons-api-Prod-migrate out.json
export const migrate = async () => {
  await checkInit();
  const { MigrationHelper } = await import("./dist/helpers/MigrationHelper.js");
  return { applied: await MigrationHelper.migrateToLatest() };
};
