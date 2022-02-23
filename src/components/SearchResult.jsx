import React from "react";
import styles from "./SearchResult.module.css";

export function SearchResult(result) {
  return (
    <li key={result.search_metadata.id} className={styles.result}>
      <p>
        Search ID:{" "}
        <a href={result.search_metadata.json_endpoint}>
          {result.search_metadata.id}
        </a>
      </p>
      <p>Query: {result.search_parameters.q}</p>
      <p>Results: {result.organic_results.length}</p>
      <p>Keys: {Object.keys(result).join("\n")}</p>
    </li>
  );
}
