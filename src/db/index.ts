import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { EnvironmentBase } from "@churchapps/apihelper";
import { Database } from "./DatabaseTypes";

let db: Kysely<Database> | null = null;

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

export function getDb(): Kysely<Database> {
  if (!db) {
    const config = parseConnectionString(EnvironmentBase.connectionString);
    db = new Kysely<Database>({
      dialect: new MysqlDialect({
        pool: createPool({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.userName,
          password: config.password,
          connectionLimit: 3,
          waitForConnections: true,
          queueLimit: 9999,
          charset: "utf8mb4",
          typeCast: function castField(field: any, useDefaultTypeCasting: () => unknown) {
            if ((field.type === "BIT") && (field.length === 1)) {
              try {
                const bytes = field.buffer();
                return (bytes[0] === 1);
              } catch { return false; }
            }
            return useDefaultTypeCasting();
          }
        })
      })
    });
  }
  return db;
}
