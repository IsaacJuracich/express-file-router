import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import FileRouter from "../../dist/cjs/index";

async function init(): Promise<void> {
  process.on("uncaughtException", (err) => {
    console.log(err);
  });

  const app = express();

  app.use(cors());
  app.use(
    bodyParser.json({
      limit: "50mb",
    })
  );
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }))
  app.use(
    "/api",
    await FileRouter(
      {
        ROUTES_DIR: "/routes",
        debug: true,
      },
      __dirname
    )
  );

  const server = createServer(app);
  const port = 3080;

  server.listen(port, () => console.log(`Server listening on port ${port}`));
}
init();
