import React from "react";
import { SearchResult } from "./SearchResult";

import PropTypes from "prop-types";
import styles from "./SearchResults.module.css";

export function SearchResults({ results, isLoading, error }) {
  if (isLoading)
    return (
      <p>
        Loading <span className={styles.loading}></span>
      </p>
    );

  if (!results || results.length === 0) {
    return <p>Click &quot;Search&quot; &uarr; to continue.</p>;
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <section>
      <h3>Search results ({results.length})</h3>
      <ul className={styles.resultsContainer}>{results.map(SearchResult)}</ul>
    </section>
  );
}

SearchResults.propTypes = {
  results: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
};
