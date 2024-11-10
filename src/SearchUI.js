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
  const [isSearchComplete, setIsSearchComplete] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-4');
  const fileInputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [performanceErrorMessage, setPerformanceErrorMessage] = useState('');

  // Helper functions
  const stripHtmlTags = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.innerText || tempDiv.textContent || '';
  };

  const summarizeOutput = (text) => {
    const sentences = text.split('. ');
    return sentences.length > 3 ? sentences.slice(0, 3).join('. ') + '.' : text;
  };

  // Internet Search Handler
  const handleInternetSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsSearchComplete(false);

    try {
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: internetInput }),
      });

      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();

      setInternetOutput(data.output);
      setIsSearchComplete(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Post to Twitter Handler
  const generateHashtags = (text) => {
    // Simple logic to extract hashtags from the text based on keywords
    const keywords = text
      .split(' ')
      .filter(word => word.length > 3) // Filter out very short words
      .map(word => word.replace(/[^a-zA-Z0-9]/g, '')) // Remove any special characters
      .filter(word => word.length > 3); // Filter out words that are too short for a hashtag
  
    // Generate hashtags by prefixing "#" to the keywords, limited to 3 hashtags
    return keywords.slice(0, 3).map(keyword => `#${keyword}`).join(' '); // Limit to 3 hashtags
};

const postToTwitter = () => {
    const cleanedOutput = stripHtmlTags(internetOutput);
    const tweetText = summarizeOutput(cleanedOutput);
    let finalTweetText = tweetText;
  
    // Ensure tweet is within character limit (280 characters)
    if (finalTweetText.length > 250) {
        finalTweetText = `${finalTweetText.substring(0, 230)}...`; // Add ellipsis if too long
    }
  
    // Generate hashtags based on content (3 hashtags)
    const hashtags = generateHashtags(finalTweetText);
  
    // Combine tweet content with hashtags
    const finalTweetWithHashtags = `${finalTweetText} ${hashtags}`;
  
    // Ensure the final tweet doesn't exceed Twitter's character limit
    if (finalTweetWithHashtags.length <= 230) {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(finalTweetWithHashtags)}`, '_blank');
    } else {
        // If it's too long, truncate the hashtags to fit within the character limit
        const availableSpace = 280 - finalTweetText.length;
        const truncatedHashtags = hashtags.substring(0, availableSpace);
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${finalTweetText} ${truncatedHashtags}`)}`, '_blank');
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

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${percentComplete}%`);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setLoading(false);
          alert('PDF uploaded and indexed successfully');
        } else {
          setLoading(false);
          setError('PDF upload failed');
        }
      };

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
    setPerformanceErrorMessage('');
  };

  const fetchPerformanceData = async () => {
    setPerformanceErrorMessage('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8010/query_database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) throw new Error('Error fetching results');
      
      const data = await response.json();
      setResponseMessage(data.result.replace(/\n/g, '<br />') || '');
      setPerformanceErrorMessage(data.result ? '' : 'No results found.');
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('');
      setPerformanceErrorMessage('Error fetching results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI Agent Interface</h1>

      <div className={styles.tabContainer}>
        {['internet', 'pdf', 'be', 'performance'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Agent
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {/* Internet Agent */}
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
            <button
              onClick={postToTwitter}
              className={styles.button}
              disabled={!isSearchComplete}
            >
              Post to Twitter
            </button>
          </>
        )}

        {/* PDF Agent */}
        {activeTab === 'pdf' && (
          <>
            <h2>PDF Query</h2>
            <div className={styles.inlineContainer}>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <button onClick={() => fileInputRef.current.click()} className={styles.button}>
                Upload PDF
              </button>
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
                  {pdfImages.map((imageUrl, index) => (
                    <img key={index} src={imageUrl} alt={`PDF Image ${index + 1}`} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Backend Agent */}
        {activeTab === 'be' && (
          <>
            <h2>Backend Agent</h2>
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
                <p dangerouslySetInnerHTML={{ __html: beOutput }} />
              </div>
            )}
          </>
        )}

        {/* Performance Summary */}
        {activeTab === 'performance' && (
          <>
            <h2>Performance Summary</h2>
            <textarea
              placeholder="Enter your query here..."
              value={query}
              onChange={handlePerformanceQueryChange}
              className={styles.textarea}
            />
            <button onClick={fetchPerformanceData} className={styles.button}>
              Submit Query
            </button>
            {responseMessage && <p dangerouslySetInnerHTML={{ __html: responseMessage }} />}
            {performanceErrorMessage && <p className={styles.error}>{performanceErrorMessage}</p>}
          </>
        )}
      </div>
    </div>
  );
}
