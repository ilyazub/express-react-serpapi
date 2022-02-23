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

export default async function handler(request, response) {
  const queries = decodeURIComponent(request.query.q).split(",");

  // The number of queries should be limited in a real application
  // but it's omitted here in favor of simplicity
  const data = await makeSearches(queries);

  response
    .status(200)
    .json(data);
}
