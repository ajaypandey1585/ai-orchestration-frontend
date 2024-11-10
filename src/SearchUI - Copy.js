import React, { useState, useRef } from 'react';
import styles from './SearchUI.module.css';

export default function SearchUI() {
  const [activeTab, setActiveTab] = useState('internet');
  const [internetInput, setInternetInput] = useState('');
  const [internetOutput, setInternetOutput] = useState('');
  const [pdfInput, setPdfInput] = useState('');
  const [pdfOutput, setPdfOutput] = useState('');
  const [pdfImages, setPdfImages] = useState([]);
  const [beInput, setBeInput] = useState('');
  const [beOutput, setBeOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-4');
  const fileInputRef = useRef(null);

  // Performance Summary States
  const [query, setQuery] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [performanceErrorMessage, setPerformanceErrorMessage] = useState('');

  // Internet Search Handler
  const handleInternetSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: internetInput }),
      });

      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();

      setInternetOutput(data.output);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // PDF Upload Handler
  const handlePdfUpload = (e) => {
    setLoading(true);
    setError('');

    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:8010/upload_pdf', true);

      // Progress handler
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${percentComplete}%`);
        }
      };

      // Load handler
      xhr.onload = () => {
        if (xhr.status === 200) {
          setLoading(false);
          alert('PDF uploaded and indexed successfully');
        } else {
          setLoading(false);
          setError('PDF upload failed');
        }
      };

      // Error handler
      xhr.onerror = () => {
        setLoading(false);
        setError('An error occurred during the upload');
      };

      xhr.send(formData);
    } else {
      setLoading(false);
    }
  };

  // PDF Query Handler
  const handlePdfQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8010/query_pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: pdfInput }),
      });

      if (!response.ok) throw new Error('PDF query failed');
      const data = await response.json();

      setPdfOutput(data.answer);
      setPdfImages(data.images);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Backend Query Handler
  const handleBeQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: beInput }),
      });

      if (!response.ok) throw new Error('Backend query failed');
      const data = await response.json();

      setBeOutput(data.result.to_html());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Performance Summary Query Handler
  const handlePerformanceQueryChange = (e) => {
    setQuery(e.target.value);
    setPerformanceErrorMessage(''); // Clear error message on new input
  };

  const fetchPerformanceData = () => {
    fetch('http://localhost:8010/query_database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then(response => response.json())
      .then(data => {
        if (data && data.result) {
          // Replace newline characters with HTML line breaks
          setResponseMessage(data.result.replace(/\n/g, '<br />'));
          setPerformanceErrorMessage('');
        } else {
          setResponseMessage('');
          setPerformanceErrorMessage('No results found.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setResponseMessage('');
        setPerformanceErrorMessage('Error fetching results. Please try again later.');
      });
  };



  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI Agent Interface</h1>

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'internet' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('internet')}
        >
          Internet Agent
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'pdf' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pdf')}
        >
          PDF Agent
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'be' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('be')}
        >
          Backend Agent
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'performance' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance Summary
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'internet' && (
          <>
            <h2>Internet Search</h2>
            <form onSubmit={handleInternetSearch}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Enter your search query..."
                  value={internetInput}
                  onChange={(e) => setInternetInput(e.target.value)}
                  className={styles.input}
                />
              </div>
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}

            {internetOutput && (
              <div className={styles.output}>
                <h3>Search Results:</h3>
                <div dangerouslySetInnerHTML={{ __html: internetOutput }} />
              </div>
            )}
          </>
        )}

        {activeTab === 'pdf' && (
          <>
            <h2>PDF Query</h2>

            {/* Container to align "Upload PDF" button with label */}
            <div className={styles.inlineContainer}>
              <div className={styles.inputGroup}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className={styles.button}
                >
                  Upload PDF
                </button>
              </div>
            </div>

            <form onSubmit={handlePdfQuery}>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={styles.modelSelect}
              >
                <option value="GPT-4">GPT-4</option>
                <option value="GPT-3.5">GPT-3.5</option>
              </select>
              <textarea
                placeholder="Enter your PDF query..."
                value={pdfInput}
                onChange={(e) => setPdfInput(e.target.value)}
                className={styles.textarea}
              />
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? 'Querying...' : 'Submit Query'}
              </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}

            {pdfOutput && (
              <div className={styles.output}>
                <h3>PDF Query Results:</h3>
                <p>{pdfOutput}</p>
                <div className={styles.imageGrid}>
                  {pdfImages.map((img, index) => (
                    <img
                      key={index}
                      src={`data:image/png;base64,${img}`}
                      alt={`Page ${index + 1}`}
                      className={styles.image}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}



        {activeTab === 'be' && (
          <>
            <h2>Backend Query</h2>
            <form onSubmit={handleBeQuery}>
              <textarea
                placeholder="Enter your backend query..."
                value={beInput}
                onChange={(e) => setBeInput(e.target.value)}
                className={styles.textarea}
              />
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? 'Querying...' : 'Submit Query'}
              </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}

            {beOutput && (
              <div className={styles.output}>
                <h3>Backend Query Results:</h3>
                <div dangerouslySetInnerHTML={{ __html: beOutput }} />
              </div>
            )}
          </>
        )}

        {activeTab === 'performance' && (
          <div className={styles.performanceContainer}>
            <h2 className={styles.header}>Performance Summary Query</h2>

            <textarea
              rows="4"
              placeholder="Enter your query in natural language"
              value={query}
              onChange={handlePerformanceQueryChange}
              className={styles.textarea}
            />

            <button onClick={fetchPerformanceData} className={styles.button}>
              Run Query
            </button>

            <div className={styles.resultsSection}>
              <h3>Generated Results</h3>
              {performanceErrorMessage ? (
                <p className={styles.error}>{performanceErrorMessage}</p>
              ) : (
                <p className={styles.responseMessage} dangerouslySetInnerHTML={{ __html: responseMessage }}></p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}