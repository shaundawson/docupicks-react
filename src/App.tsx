// React and MUI imports
import { useEffect, useState } from 'react';
import { CircularProgress, Box, Alert, Grid, Container, CssBaseline, Chip, Typography } from '@mui/material';
import Grow from '@mui/material/Grow';

// Component imports
import { Header } from './components/Header';
import { MovieCard } from './components/MovieCard';
import { Footer } from './components/Footer';
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import { imdbDarkTheme, imdbLightTheme } from './theme';
import { KEYWORDS } from './keywords';
import { useCachedDocs } from './hooks/useCachedDocs'; //  Caching hook

import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure({
  ...awsconfig,
  API: {
    endpoints: [
      {
        name: "docupicksApi",
        endpoint: "https://3oz8vqqgwh.execute-api.us-east-1.amazonaws.com/v1",
        region: "us-east-1"
      }
    ]
  }
});

// Root App component
function App() {
  // State for theme toggle
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  // State for animated keyword index
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(-1);

  // Use the custom hook to get movies, loading, and error state
  const { data: movies, loading, error } = useCachedDocs();

  // Animated keyword effect
  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setCurrentKeywordIndex((prev) => Math.min(prev + 1, KEYWORDS.length - 1));
      }, 300); // Adjust timing between keyword appearances

      return () => clearInterval(timer);
    } else {
      setCurrentKeywordIndex(KEYWORDS.length - 1); // Show all immediately when loaded
    }
  }, [loading]);

  // Load saved theme preference from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('docupicksTheme');
    if (savedTheme) setIsDarkTheme(savedTheme === 'dark');
  }, []);

  // Persist theme preference to local storage
  useEffect(() => {
    localStorage.setItem('docupicksTheme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  return (
    <ThemeProvider theme={isDarkTheme ? imdbDarkTheme : imdbLightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header
          toggleTheme={() => setIsDarkTheme(!isDarkTheme)}
          isDarkTheme={isDarkTheme}
        />

        <Container component="main" maxWidth="xl" sx={{ py: 4, flex: 1, px: { xs: 2, sm: 3 } }}>
          {/* Enhanced loading state */}
          {loading && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '50vh',
              textAlign: 'center'
            }}>
              <Box sx={{ position: 'relative', width: 64, height: 64, mb: 3 }}>
                <CircularProgress
                  size={64}
                  thickness={2}
                  sx={{
                    position: 'absolute',
                    color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                  }}
                />
                <CircularProgress
                  size={64}
                  thickness={2}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    animationDuration: '2s',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    }
                  }}
                />
              </Box>
              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                Curating top documentaries about...
              </Typography>
            </Box>
          )}

          {/* Error display */}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Animated keywords section */}
          <Box sx={{
            mb: 4,
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
            px: { xs: 0, sm: 2 },
            minHeight: loading ? '20vh' : 'auto'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, alignSelf: 'center' }}>
              Topics:
            </Typography>
            {KEYWORDS.map((keyword, index) => (
              <Grow
                key={index}
                in={currentKeywordIndex >= index}
                timeout={500}
                style={{ transformOrigin: 'center bottom' }}
              >
                <Chip
                  label={keyword}
                  size="medium"
                  sx={{
                    borderRadius: '6px',
                    textTransform: 'capitalize',
                    fontWeight: 500,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    transition: 'all 0.3s ease',
                    transform: currentKeywordIndex >= index ? 'scale(1)' : 'scale(0.8)',
                    opacity: currentKeywordIndex >= index ? 1 : 0,
                    mr: 1,
                    mb: 1
                  }}
                />
              </Grow>
            ))}
          </Box>

          {/* Grid layout for displaying movies */}
          <Grid
            container
            spacing={3}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))'
              },
              gap: 3,
              padding: '0 24px !important'
            }}
          >
            {movies.map((movie, idx) => (
              <Box
                key={
                  movie.imdbID && movie.tmdbId
                    ? `${movie.imdbID}-${movie.tmdbId}`
                    : movie.imdbID
                      ? movie.imdbID
                      : movie.Title
                        ? `${movie.Title}-${idx}`
                        : `movie-${idx}`
                }
                sx={{ width: '100%' }}
              >
                <MovieCard movie={movie} />
              </Box>
            ))}
          </Grid>
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
