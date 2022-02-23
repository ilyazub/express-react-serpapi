const { GoogleSearch } = require("google-search-results-nodejs");
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

function makeSearches(queries) {
  const promises = queries.map((q) => {
    const params = {
      q,
      location: "Austin, TX",
    };

    return promisifiedGetJson(params);
  });

  return Promise.all(promises);
}

exports.makeSearches = makeSearches;
