import React from "react";
import { SearchResult } from "./SearchResult";

export function SearchResults({ results, isLoading, error }) {
  if (isLoading)
    return <p>Loading...</p>;

  if (!results || results.length === 0) {
    return <p>Click "Search" &uarr; to continue.</p>;
  }

  if (error)
    return <p>Error: {error}</p>;

  return (
    <section>
      <span>Search results:</span>
      <ul>{results.map(SearchResult)}</ul>
    </section>
  );
}
