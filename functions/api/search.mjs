import { GoogleSearch } from "google-search-results-nodejs";
const search = new GoogleSearch(process.env.SERP_API_KEY);

// Workaround to make it work with Promises
// https://github.com/serpapi/google-search-results-nodejs/issues/4
function promisifiedGetJson(params) {
  return new Promise((resolve, reject) => {
    try {
      search.json(params, resolve);
    } catch (e) {
      reject(e);
    }
  });
}

export function makeSearches(queries) {
  const promises = queries.map((q) => {
    const params = {
      q,
      location: "Austin, TX",
    };

    return promisifiedGetJson(params);
  });

  return Promise.all(promises);
}

// https://developers.cloudflare.com/pages/platform/functions#writing-your-first-function
export async function onRequestGet({ params }) {
  // TODO: Deduplicate request params retrieval
  const queries = decodeURIComponent(params.q).split(",");

  const data = await makeSearches(queries);

  const info = JSON.stringify(data);
  return new Response(info, null, 2);
}
