import React from "react";

export function SearchResult(result) {
  return (
    <li key={result.search_metadata.id}>
      {result.search_metadata.id} &rarr; {result.search_parameters.q}
    </li>
  );
}
