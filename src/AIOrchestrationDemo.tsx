import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Container, IconButton
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AIDashboard from './AIDashboard'; // Import the new dashboard component
import DemoContent from './DemoContent'; // Assume we've moved the demo content to a separate file

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const AIOrchestrationDemo = () => {
  const [currentView, setCurrentView] = useState('demo');

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => setCurrentView('demo')}
          >
            AI Orchestration Demo
          </Typography>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ mr: 2, cursor: 'pointer' }}
            onClick={() => setCurrentView('dashboard')}
          >
            AI Dashboard
          </Typography>
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {currentView === 'demo' ? <DemoContent /> : <AIDashboard />}
      </Container>
    </ThemeProvider>
  );
};

export default AIOrchestrationDemo;