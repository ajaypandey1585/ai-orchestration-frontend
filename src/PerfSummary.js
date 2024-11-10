import React, { useState } from 'react';
import './PerformanceSummary.css';

const PerformanceSummaryTab = () => {
  const [query, setQuery] = useState('');
  const [responseMessage, setResponseMessage] = useState(''); // State for the API response
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setErrorMessage(''); // Clear error message on new input
  };

  const fetchData = () => {
    fetch('http://localhost:8010/query_database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Complete Response:', data); // Log the complete response
      if (data && data.result) {
        setResponseMessage(data.result); // Set the result string directly
        setErrorMessage(''); // Clear any previous error messages
      } else {
        console.log("No results found in response.");
        setResponseMessage(''); // Clear response message if no result
        setErrorMessage('No results found.'); // Set an appropriate message
      }
    })
    .catch(error => {
      console.error('Error:', error);
      setResponseMessage(''); // Clear response message on error
      setErrorMessage('Error fetching results. Please try again later.'); // Set an error message
    });
  };

  return (
    <div className="performance-summary-container">
      <h2 className="header">Performance Summary Query</h2>

      <textarea
        rows="4"
        cols="50"
        placeholder="Enter your query in natural language"
        value={query}
        onChange={handleQueryChange}
        className="query-input"
      />

      <button className="run-query-button" onClick={fetchData}>
        Run Query
      </button>

      <div className="results-section">
        <h3>Generated Results</h3>
        
        {errorMessage && ( // Display error message if it exists
          <p style={{ color: 'red' }}>{errorMessage}</p>
        )}

        {responseMessage ? ( // Check if response message exists
          <p style={{ whiteSpace: 'pre-wrap' }}>{responseMessage}</p> // Use pre-wrap to preserve newlines
        ) : (
          !errorMessage && <p>No results found.</p> // Show this only if there's no error message
        )}
      </div>
    </div>
  );
};

export default PerformanceSummaryTab;