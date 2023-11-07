# **express-file-router**

# **Installation**

```
npm install express-file-router-2
```

# **How to Use**

You can integrate the file router by using it as a middleware like this:

```js
app.use(
  "/api",
  await FileRouter(
    {
      ROUTES_DIR: "/routes", // directory of your routes
      debug: true, // simple console.log's
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
import FileRouter from "express-file-router-2";

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

# **Route Setup**

## **Example Structure**

[Structure Setup](https://github.com/IsaacJuracich/express-file-router/tree/main/example/src/routes)

```php
├── index.ts // main file
├── routes
    ├── get.ts // get
    ├── dynamic // params
        ├── param
            ├── [example].ts // single
            └── [...slug].ts // get all
    └── user
        ├── index.ts // user
    └── post.ts
```

## **Middleware**

You are able to add route specific middlewares by exporting an array like this:

**Post Example**

```js
import { RequestHandler } from "express";
import UserSession from "@/middleware/session/user";

export const post = [
  // inside of file
  async (req, res, next) => {
    console.log("headers", req.headers);

    return next();
  },
  // imported middelware from file
  UserSession,
  async (req, res) => {
    const { userID } = req.params;

    console.log("req.params", req.params);

    return res.status(200).json({
      message: "Success",
      userID,
    });
  },
] as RequestHandler[];
```

**Get Example**

```js
import { RequestHandler } from "express";
import UserSession from "@/middleware/session/user";

export const get = [
  // inside of file
  async (req, res, next) => {
    console.log("headers", req.headers);

    return next();
  },
  // imported middelware from file
  UserSession,
  async (req, res) => {
    const { userID } = req.params;

    console.log("req.params", req.params);

    return res.status(200).json({
      message: "Success",
      userID,
    });
  },
] as RequestHandler[];
```
