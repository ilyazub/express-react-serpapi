const path = require("path");
const fs = require("fs");

require("dotenv").config();

const express = require("express");
const { createServer: createViteServer } = require("vite");

const { makeSearches } = require("./api.js");

const { PORT = 3000 } = process.env;

async function createServer() {
  const app = express();

  app.set("json spaces", 2);
  app.use(express.json());

  app.get("/api/search", async (req, res, next) => {
    const queries = decodeURIComponent(req.query.q).split(",");

    // The number of queries should be limited in a real application
    // but it's omitted here in favor of simplicity
    makeSearches(queries)
      .then((results) => {
        res.send(results);
      })
      .catch((e) => next(e));
  });

  // Create Vite server in middleware mode. This disables Vite's own HTML
  // serving logic and let the parent server take control.
  //
  // In middleware mode, if you want to use Vite's own HTML serving logic
  // use `'html'` as the `middlewareMode` (ref https://vitejs.dev/config/#server-middlewaremode)
  const vite = await createViteServer({
    server: { middlewareMode: "ssr" },
  });
  // use Vite's connect instance as middleware
  app.use(vite.middlewares);

  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // 1. Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, "index.html"),
        "utf-8"
      );

      // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
      //    also applies HTML transforms from Vite plugins, e.g. global preambles
      //    from @vitejs/plugin-react
      template = await vite.transformIndexHtml(url, template);

      // 3. Load the server entry. vite.ssrLoadModule automatically transforms
      //    your ESM source code to be usable in Node.js! There is no bundling
      //    required, and provides efficient invalidation similar to HMR.
      const { render } = await vite.ssrLoadModule("./src/entry-server.jsx");

      // 4. render the app HTML. This assumes entry-server.js's exported `render`
      //    function calls appropriate framework SSR APIs,
      //    e.g. ReactDOMServer.renderToString()
      const appHtml = await render(url);

      // 5. Inject the app-rendered HTML into the template.
      const html = template.replace(`<!--ssr-outlet-->`, appHtml);

      // 6. Send the rendered HTML back.
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      // If an error is caught, let Vite fix the stacktrace so it maps back to
      // your actual source code.
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(PORT);
}

createServer();
