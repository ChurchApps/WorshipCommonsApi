import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import dotenv from "dotenv";
import { EnvironmentBase } from "@churchapps/apihelper";
import { Environment } from "../src/helpers/Environment.js";

let initialized = false;

export async function ensureEnvironment() {
  if (!initialized) {
    dotenv.config();
    const env = process.env.APP_ENV || "dev";
    await Environment.init(env);
    initialized = true;
  }
}

function parseConnectionString(connectionString: string) {
  const firstSplit = connectionString.replace("mysql://", "").split("@");
  const userPass = firstSplit[0].split(":");
  const userName = userPass[0];
  const password = userPass[1];

  const hostDb = firstSplit[1].split("/");
  const database = hostDb[1];
  const hostPort = hostDb[0].split(":");
  const host = hostPort[0];
  const port = parseInt(hostPort[1], 10);

  return { host, port, database, userName, password };
}

export function createKysely(): Kysely<any> {
  const config = parseConnectionString(EnvironmentBase.connectionString);

  const dialect = new MysqlDialect({
    pool: createPool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.userName,
      password: config.password,
      connectionLimit: 3,
      charset: "utf8mb4",
      typeCast(field: any, next: () => unknown) {
        if (field.type === "BIT" && field.length === 1) {
          const bytes = field.buffer();
          return bytes ? bytes[0] === 1 : null;
        }
        return next();
      }
    })
  });

  return new Kysely({ dialect });
}

export async function ensureDatabaseExists() {
  const config = parseConnectionString(EnvironmentBase.connectionString);

  const pool = createPool({
    host: config.host,
    port: config.port,
    user: config.userName,
    password: config.password,
    connectionLimit: 1
  });

  try {
    await pool.promise().execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
  } finally {
    await pool.promise().end();
  }
}
