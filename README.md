# express-file-router

# Installation

```
npm install express-file-router
```

# How to Use

You can integrate the file router by using it as a middleware like this:

```js
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
```

[Example Express Setup](https://github.com/IsaacJuracich/express-file-router/tree/main/example)

```js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import FileRouter from "express-file-router";

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
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

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
```
