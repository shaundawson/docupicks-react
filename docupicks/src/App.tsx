import { useEffect, useState } from 'react';
import { CircularProgress, Box, Alert, Grid, Container, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import axios from 'axios';
import { Header } from './components/Header';
import { MovieCard } from './components/MovieCard';
import { Footer } from './components/Footer';
import type { Movie } from './types';
import './App.css';

const initialDocs = ['13th', 'Citizenfour', 'Icarus', 'Free Solo', 'The Act of Killing'];

function useColumns() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));

  if (isXs) return 1;
  if (isSm) return 2;
  if (isMd) return 3;
  return 4; // lg and up
}

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const columns = useColumns();

  useEffect(() => {
    const fetchInitialMovies = async () => {
      try {
        setLoading(true);
        const requests = initialDocs.map(title =>
          axios.get(
            `https://www.omdbapi.com/?t=${title}&plot=full&apikey=${import.meta.env.VITE_OMDB_API_KEY}`
          )
        );

        const responses = await Promise.all(requests);
        const validMovies = responses
          .map(res => res.data)
          .filter(movie => movie.Response === 'True' && movie.Genre.includes('Documentary'))
          .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating));

        setMovies(validMovies);
      } catch (err) {
        setError('Failed to load initial documentaries');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMovies();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `https://www.omdbapi.com/?t=${encodeURIComponent(searchTerm)}&plot=full&apikey=${import.meta.env.VITE_OMDB_API_KEY
        }`
      );

      if (response.data.Response === 'True') {
        if (!response.data.Genre.includes('Documentary')) {
          setError('This movie is not a documentary');
          return;
        }

        setMovies(prev => {
          const exists = prev.some(m => m.imdbID === response.data.imdbID);
          if (!exists) {
            return [...prev, response.data].sort(
              (a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating)
            );
          }
          setError('Documentary already in list');
          return prev;
        });
        setSearchTerm('');
        setError('');
      } else {
        setError(response.data.Error || 'Movie not found');
      }
    } catch (err) {
      setError('An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
        />

        <Container
          component="main"
          maxWidth="xl"
          sx={{
            py: 4,
            flex: 1,
            px: { xs: 2, sm: 3, md: 4 }
          }}
        >
          {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid
            container
            spacing={3}
            sx={{
              '--columns': columns,
              width: '100%',
              margin: '0 auto',
              justifyContent: 'center',
              padding: '0 24px !important'
            }}
          >
            {movies.map(movie => (
              <Grid
                item
                key={movie.imdbID}
                xs={12}
                sx={{
                  display: 'flex',
                  flexGrow: 0,
                  flexBasis: `calc(100% / var(--columns) - 24px)`,
                  maxWidth: `calc(100% / var(--columns) - 24px)`,
                  justifyContent: 'center'
                }}
              >
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>
        </Container>

        <Footer />
      </Box>
    </>
  );
}

export default App;