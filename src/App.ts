import dotenv from "dotenv";
import "reflect-metadata";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import { bindings } from "./inversify.config";
import express from "express";
import path from "path";
import { CustomAuthProvider, EnvironmentBase } from "@churchapps/apihelper";
import cors from "cors";

(BigInt.prototype as any).toJSON = function () { return this.toString(); };

export const init = async () => {
  dotenv.config();
  const container = new Container();
  await container.loadAsync(bindings);
  const app = new InversifyExpressServer(container, null, null, null, CustomAuthProvider);

  const configFunction = (expApp: express.Application) => {
    expApp.use(
      cors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
      })
    );

    expApp.options("*", (_req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
      res.sendStatus(200);
    });

    // Lambda: serverless-express stages the body directly; parse before body-parser or POSTs die with "stream is not readable"
    expApp.use((req, _res, next) => {
      const contentType = req.headers["content-type"] || "";
      let handled = false;

      if (Buffer.isBuffer(req.body)) {
        try {
          const bodyString = req.body.toString("utf8");
          req.body = contentType.includes("application/json") ? JSON.parse(bodyString) : bodyString;
        } catch {
          req.body = {};
        }
        handled = true;
      } else if (req.body && req.body.type === "Buffer" && Array.isArray(req.body.data)) {
        try {
          const bodyString = Buffer.from(req.body.data).toString("utf8");
          req.body = contentType.includes("application/json") ? JSON.parse(bodyString) : bodyString;
        } catch {
          req.body = {};
        }
        handled = true;
      } else if (typeof req.body === "string" && req.body.length > 0) {
        try {
          if (contentType.includes("application/json")) req.body = JSON.parse(req.body);
        } catch {
          // keep raw body
        }
        handled = true;
      }

      if (handled) (req as any)._body = true;
      next();
    });

    expApp.use(express.json({ limit: "50mb" }));
    expApp.use(express.urlencoded({ extended: true, limit: "50mb" }));

    if (EnvironmentBase.fileStore !== "S3") {
      expApp.use("/content", express.static(path.resolve("./content")));
    }
  };

  app.setErrorConfig((expApp) => {
    expApp.use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error("Global error handler:", error);
      const statusCode = error.statusCode || error.status || 500;
      const message = error.message || "Internal Server Error";
      res.status(statusCode).json({ error: { message, status: statusCode, timestamp: new Date().toISOString(), path: req.path } });
    });

    expApp.use((req: express.Request, res: express.Response) => {
      res.status(404).json({ error: { message: "Endpoint not found", status: 404, timestamp: new Date().toISOString(), path: req.path } });
    });
  });

  const server = app.setConfig(configFunction).build();
  return server;
};
