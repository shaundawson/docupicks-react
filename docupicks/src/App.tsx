import { useEffect, useState } from 'react';
import { CircularProgress, Box, Alert, Grid, Container, CssBaseline } from '@mui/material';
import axios from 'axios';
import { Header } from './components/Header';
import { MovieCard } from './components/MovieCard';
import { Footer } from './components/Footer';
import type { Movie } from './types';
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import { imdbDarkTheme, imdbLightTheme } from './theme';


// Config Constants
const DEBUG = true;
const MAX_RETRY_PAGES = 4;
const DOCUMENTARY_GENRE_ID = 99;
const TOP_MOVIES_LIMIT = 12;
const FALLBACK_MOVIES = ['13th', 'Citizenfour', 'Icarus', 'Free Solo', 'The Act of Killing'];
const OMDB_DELAY = 500;
const MIN_YEAR = 2020;
const MAX_YEAR = 2025;

interface TMDBMovie {
  id: number;
  title: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  overview: string;
}

interface MovieDetails extends Movie {
  imdbRating: string;
  Year: string;
  Genre: string;
}

async function fetchDocumentaries(page: number): Promise<TMDBMovie[]> {
  try {
    const params = {
      api_key: import.meta.env.VITE_TMDB_API_KEY,
      with_genres: DOCUMENTARY_GENRE_ID,
      sort_by: 'popularity.desc',
      'vote_count.gte': 100,
      'vote_average.gte': 8.0,
      'primary_release_date.gte': `${MIN_YEAR}-01-01`,
      'primary_release_date.lte': `${MAX_YEAR}-12-31`,
      include_adult: false,
      page,
      language: 'en-US',
      region: 'US'
    };

    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', { params });
    return response.data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      release_date: movie.release_date,
      overview: movie.overview
    }));
  } catch (error) {
    console.error('TMDB API Error:', error);
    return [];
  }
}

async function validateMovie(tmdbMovie: TMDBMovie): Promise<MovieDetails | null> {
  try {
    const releaseYear = tmdbMovie.release_date?.split('-')[0] || '';
    const response = await axios.get(`https://www.omdbapi.com/`, {
      params: {
        t: tmdbMovie.title,
        y: releaseYear,
        type: 'movie',
        apikey: import.meta.env.VITE_OMDB_API_KEY
      }
    });

    if (response.data.Response !== 'True') return null;

    const movieYear = parseInt(response.data.Year || releaseYear);
    if (movieYear < MIN_YEAR || movieYear > MAX_YEAR) return null;

    const isDocumentary = [
      response.data.Genre?.toLowerCase(),
      response.data.Plot?.toLowerCase(),
      tmdbMovie.overview?.toLowerCase()
    ].some(text => text?.includes('documentary'));

    const hasRating = response.data.imdbRating !== 'N/A';
    if (!isDocumentary || !hasRating) return null;

    return {
      ...response.data,
      imdbRating: response.data.imdbRating,
      Year: response.data.Year,
      Genre: response.data.Genre,
      Poster: response.data.Poster !== 'N/A' ? response.data.Poster : '/placeholder.jpg'
    };
  } catch (error) {
    console.error(`Validation failed for ${tmdbMovie.title}:`, error);
    return null;
  }
}

async function loadMovies() {
  try {
    let page = 1;
    const movies: TMDBMovie[] = [];
    const uniqueTitles = new Set<string>();

    while (movies.length < TOP_MOVIES_LIMIT && page <= MAX_RETRY_PAGES) {
      const pageResults = await fetchDocumentaries(page);
      const newMovies = pageResults.filter(movie => {
        const movieYear = parseInt(movie.release_date?.split('-')[0] || '0');
        return !uniqueTitles.has(movie.title) && movieYear >= MIN_YEAR && movieYear <= MAX_YEAR;
      });

      newMovies.forEach(movie => uniqueTitles.add(movie.title));
      movies.push(...newMovies);
      page++;
    }

    const batchSize = 5;
    const validated: MovieDetails[] = [];

    for (let i = 0; i < movies.length; i += batchSize) {
      const batch = movies.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(validateMovie));
      validated.push(...results.filter(Boolean) as MovieDetails[]);
      await new Promise(resolve => setTimeout(resolve, OMDB_DELAY));
    }

    if (validated.length === 0) {
      const fallbackResults = await Promise.all(
        FALLBACK_MOVIES.map(title =>
          axios.get(`https://www.omdbapi.com/?t=${title}&apikey=${import.meta.env.VITE_OMDB_API_KEY}`)
        )
      );
      return fallbackResults
        .map(res => res.data)
        .filter(movie => movie.Response === 'True')
        .slice(0, TOP_MOVIES_LIMIT);
    }

    return validated
      .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
      .slice(0, TOP_MOVIES_LIMIT);
  } catch (error) {
    console.error('Movie loading failed:', error);
    return [];
  }
}

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    const savedTheme = localStorage.getItem('docupicksTheme');
    if (savedTheme) setIsDarkTheme(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('docupicksTheme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);


  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const loadedMovies = await loadMovies();
        setMovies(loadedMovies);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load movies');
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(searchTerm)}&apikey=${import.meta.env.VITE_OMDB_API_KEY}`);

      if (response.data.Response !== 'True' || !response.data.Genre.toLowerCase().includes('documentary')) {
        throw new Error(response.data.Error || 'Not a documentary');
      }

      setMovies(prev => {
        const exists = prev.some(m => m.imdbID === response.data.imdbID);
        return exists ? prev : [...prev, response.data].sort((a, b) =>
          parseFloat(b.imdbRating) - parseFloat(a.imdbRating)
        );
      });
      setSearchTerm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={isDarkTheme ? imdbDarkTheme : imdbLightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
          toggleTheme={() => setIsDarkTheme(!isDarkTheme)}
          isDarkTheme={isDarkTheme}
        />

        <Container component="main" maxWidth="xl" sx={{ py: 4, flex: 1, px: { xs: 2, sm: 3 } }}>
          {loading && <CircularProgress sx={{ display: 'block', margin: '4rem auto' }} />}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Grid container spacing={3} sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))'
            },
            gap: 3,
            padding: '0 24px !important'
          }}>
            {movies.map(movie => (
              <Grid item key={movie.imdbID} xs={12} sm={6} md={4} lg={3}>
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;