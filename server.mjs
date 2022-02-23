import { URL } from 'url';
const __dirname = new URL('.', import.meta.url).pathname;

import path from "path";
import fs from "fs";

import 'dotenv/config'

import express from "express";
import { createServer as createViteServer } from "vite";

import { makeSearches } from "./functions/api/search.mjs";

const { PORT = 3000 } = process.env;

async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  const resolve = (p) => path.resolve(__dirname, p);

  const indexProd = isProd
    ? fs.readFileSync(resolve("dist/client/index.html"), "utf-8")
    : "";

  const app = express();

  app.get("/api/search", async (req, res, next) => {
    const queries = decodeURIComponent(req.query.q).split(",");

    // The number of queries should be limited in a real application
    // but it's omitted here in favor of simplicity
    makeSearches(queries)
      .then((results) => {
        res
          .status(200)
          .set({ "Content-Type": "application/json" })
          .send(results);
      })
      .catch((e) => next(e));
  });

  let vite;
  if (!isProd) {
    // Create Vite server in middleware mode. This disables Vite's own HTML
    // serving logic and let the parent server take control.
    //
    // In middleware mode, if you want to use Vite's own HTML serving logic
    // use `'html'` as the `middlewareMode` (ref https://vitejs.dev/config/#server-middlewaremode)
    vite = await createViteServer({
      root,
      server: {
        middlewareMode: "ssr",
      },
    });

    // use Vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    app.use(require("compression")());
    app.use(
      require("serve-static")(resolve("dist/client"), {
        index: false,
      })
    );
  }

  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template, render;

      // 1. Read index.html
      if (!isProd) {
        // always read fresh template in dev
        template = fs.readFileSync(resolve("index.html"), "utf-8");

        // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
        //    also applies HTML transforms from Vite plugins, e.g. global preambles
        //    from @vitejs/plugin-react
        template = await vite.transformIndexHtml(url, template);

        // 3. Load the server entry. vite.ssrLoadModule automatically transforms
        //    your ESM source code to be usable in Node.js! There is no bundling
        //    required, and provides efficient invalidation similar to HMR.
        render = (await vite.ssrLoadModule("/src/entry-server.jsx")).render;
      } else {
        template = indexProd;
        render = require("./dist/server/entry-server.js").render;
      }

      let context = {};

      // 4. render the app HTML. This assumes entry-server.js's exported `render`
      //    function calls appropriate framework SSR APIs,
      //    e.g. ReactDOMServer.renderToString()
      const appHtml = await render(url, context);

      // 5. Inject the app-rendered HTML into the template.
      const html = template.replace(`<!--ssr-outlet-->`, appHtml);

      // 6. Send the rendered HTML back.
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      // If an error is caught, let Vite fix the stacktrace so it maps back to
      // your actual source code.
      !isProd && vite.ssrFixStacktrace(e);

      console.log(e.stack);
      // next(e);
      res.status(500).end(e.stack);
    }
  });

  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
}

createServer();
