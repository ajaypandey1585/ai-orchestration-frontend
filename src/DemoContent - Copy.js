import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, 
  TextField, Button, Select, MenuItem, IconButton, Drawer, Box, InputLabel, Checkbox, FormControlLabel 
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AIDashboard from './AIDashboard.tsx'; 
import SearchUI from './SearchUI';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const questions = [
  { id: 1, text: "What is AI?", color: "#FF00FF" },
  { id: 2, text: "How does machine learning work?", color: "#4caf50" },
  { id: 3, text: "Explain neural networks", color: "#ff9800" },
  { id: 4, text: "What are the applications of AI?", color: "#f44336" },
];

const DemoContent = () => {
  const [query, setQuery] = useState('');
  const [model, setModel] = useState('GPT-4');
  const [knowledgeBaseResponse, setKnowledgeBaseResponse] = useState('');
  const [internetResults, setInternetResults] = useState([]);
  const [settings, setSettings] = useState({
    temperature: 0.7,
    index: 'no_index',
    promptOverride: '',
    includeInternet: false
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState('demo');
  const [indexes, setIndexes] = useState([]);

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:5000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, model, settings }),
      });
      const data = await res.json();
      setKnowledgeBaseResponse(data.knowledge_base_response);
      setInternetResults(data.internet_results || []);
    } catch (error) {
      console.error('Error:', error);
      setKnowledgeBaseResponse('An error occurred while processing your request.');
      setInternetResults([]);
    }
  };

  const handleTitleClick = () => {
    setCurrentView('demo');
  };

  const handleDashboardClick = () => {
    setCurrentView('dashboard');
  };

  const handleSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/indexes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setIndexes(data); 
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={handleTitleClick}
          >
            AI Orchestration Demo
          </Typography>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ mr: 2, cursor: 'pointer' }}
            onClick={handleDashboardClick}
          >
            AI Dashboard
          </Typography>
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
            <SettingsIcon onClick={handleSettings} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <SearchUI />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {currentView === 'demo' ? (
          <>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {questions.map((q) => (
                <Grid item xs={6} key={q.id}>
                  <Card 
                    sx={{ 
                      backgroundColor: q.color,
                      color: 'white', 
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.9 },
                    }} 
                    onClick={() => setQuery(q.text)}
                  >
                    <CardContent>{q.text}</CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                sx={{ minWidth: 120, mr: 2 }}
              >
                <MenuItem value="GPT-4">GPT-4</MenuItem>
                <MenuItem value="GPT-4-Research">GPT-4-Research</MenuItem>
                <MenuItem value="Claude">Claude</MenuItem>
                <MenuItem value="HuggingFace">HuggingFace</MenuItem>
              </Select>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query here"
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmit} 
              fullWidth
              sx={{ mb: 2 }}
            >
              Submit Query
            </Button>

            {knowledgeBaseResponse && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Knowledge Base Response:</Typography>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{knowledgeBaseResponse}</ReactMarkdown>
                </CardContent>
              </Card>
            )}

            {settings.includeInternet && internetResults.length > 0 && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Internet Results:</Typography>
                  <ul>
                    {internetResults.map((result, index) => (
                      <li key={index}>{result}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Typography variant="h4" sx={{ mt: 4 }}>
            AI Dashboard Content Will Go Here
            <AIDashboard />
          </Typography>
        )}
      </Container>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>LLM Settings</Typography>
          <TextField
            fullWidth
            label="Temperature"
            type="number"
            value={settings.temperature}
            onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
            inputProps={{ min: 0, max: 1, step: 0.1 }}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={settings.includeInternet}
                onChange={(e) => setSettings({ ...settings, includeInternet: e.target.checked })}
              />
            }
            label="Include Internet Search"
            sx={{ mb: 2 }}
          />
          <InputLabel id="index-select-label">Index</InputLabel>
          <Select 
            fullWidth 
            sx={{ mb: 2 }}
            labelId="index-select-label"
            value={settings.index}
            onChange={(e) => setSettings({ ...settings, index: e.target.value })}
          >
            <MenuItem value="no_index">No Index</MenuItem>
            {indexes.map((index) => (
              <MenuItem key={index} value={index}>{index}</MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            label="Prompt Override"
            multiline
            rows={4}
            value={settings.promptOverride}
            onChange={(e) => setSettings({...settings, promptOverride: e.target.value})}
          />
        </Box>
      </Drawer>
    </ThemeProvider>
  );
};

export default DemoContent;