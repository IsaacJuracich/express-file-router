import express, { RequestHandler } from "express";
import { readdirSync, lstatSync } from "fs";
import moment from "moment";

type Route = {
  reqPath: string;
  path: string;
  handler: RequestHandler;
  method: string;
};

type Config = {
  ROUTES_DIR: string;
  debug: boolean;
};

let dir_name: string;
const routes = new Map<string, Route>();

export default async function FileRouter(
  config: Config,
  dirname: string
): Promise<express.Router> {
  const router = express.Router();

  dir_name = dirname;

  const start = Date.now();

  await getRoutes(dirname + config.ROUTES_DIR + "/");

  if (config.debug) {
    console.log(
      "[FileRouter] Cached routes loaded in",
      moment(Date.now() - start).format("mm:ss.SSS") + " seconds"
    );
    console.log("[FileRouter] Routes", routes);
  }

  router.all("*", async (req, res, next) => {
    try {
      const path = req.path;
      console.log("path", path);

      const route = await getRoute(path);

      console.log("route", route);
      if (!route) return next();

      const {
        route: { handler },
        params,
      } = route;

      if (!handler) return next();

      req.params = {
        ...req.params,
        ...params,
      };

      if (req.method.toLowerCase() !== route.route.method.toLowerCase())
        return next();

      if (typeof handler === "object") {
        if (!handler) return next();

        const handlerFixed = handler as RequestHandler[];
        for (let i = 0; i < handlerFixed.length; i++) {
          const handlerFunction = handlerFixed[i];

          if (i === handlerFixed.length - 1) {
            return handlerFunction(req, res, next);
          }
          const middlewareFunction = handlerFunction;

          await middlewareFunction(req, res, next);
        }
      }

      return handler(req, res, next);
    } catch (err) {
      console.log("[File Router] Error", err);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  });

  return router;
}

export async function getHandler(route: Route): Promise<{
  handler: RequestHandler;
  method: string;
} | null> {
  try {
    const { path } = route;
    const handler = await import(path);

    const handlerFunction =
      handler.default || handler.get || handler.post || handler.handler;
    const method = Object.keys(handler)[0];

    return {
      handler: handlerFunction,
      method: method,
    };
  } catch (err) {
    console.log("[File Router] Error", err);
    return null;
  }
}

export async function getRoute(reqPath: string): Promise<{
  route: Route;
  params: any;
} | null> {
  const route = routes.get(reqPath);

  if (!route) {
    for (const [key, _] of routes) {
      const splitKey = key.split("/");
      const splitReqPath = reqPath.split("/");

      if (splitKey.length !== splitReqPath.length) {
        const lastSplitKey = splitKey[splitKey.length - 1];

        if (lastSplitKey === "[...slug]") {
          const route = await getRoute(
            splitKey.slice(0, splitKey.length - 1).join("/") + "/[...slug]"
          );

          if (!route) continue;

          return {
            route: route.route,
            params: {
              ...route.params,
              slug: splitReqPath.slice(splitKey.length - 1),
            },
          };
        }

        continue;
      }
      for (let i = 0; i < splitKey.length; i++) {
        const key = splitKey[i];
        const reqPath = splitReqPath[i];

        if (key.startsWith("[") && key.endsWith("]")) {
          const keyName = key.replace("[", "").replace("]", "");
          const keyVal = reqPath;

          const route = await getRoute(
            splitKey.slice(0, i).join("/") + "/" + key
          );

          if (!route) continue;

          return {
            route: route.route,
            params: {
              ...route.params,
              [keyName]: keyVal,
            },
          };
        }
      }
    }

    return null;
  }

  return {
    route,
    params: {},
  };
}

export async function getRoutes(path: string) {
  const files = readdirSync(path);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isFolder = lstatSync(path + file).isDirectory();

    if (file.endsWith(".js") || file.endsWith(".ts")) {
      const regex = new RegExp(
        `^${dir_name}/routes|(\\.ts|\\.js|/index)?`,
        "g"
      );
      const reqPath = (path + file).replace(regex, "");

      const route = {
        reqPath,
        path: path + file,
      } as Route;

      const handlerInformation = await getHandler(route);
      if (!handlerInformation) continue;

      const { handler, method } = handlerInformation;
      routes.set(reqPath, {
        ...route,
        handler,
        method,
      });
    }

    if (isFolder) await getRoutes(path + file + "/");
  }
}
