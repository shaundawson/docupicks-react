// React and MUI imports
import { useEffect, useState } from 'react';
import { CircularProgress, Box, Alert, Grid, Container, CssBaseline } from '@mui/material';
import axios from 'axios';

// Component imports
import { Header } from './components/Header';
import { MovieCard } from './components/MovieCard';
import { Footer } from './components/Footer';
import type { Movie } from './types';
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import { imdbDarkTheme, imdbLightTheme } from './theme';
import { FALLBACK_MOVIES } from './fallbackMovies';

// Configuration constants
const DEBUG = true; // Enable debug logs
const MAX_RETRY_PAGES = 2; // Max number of TMDB pages to query
const DOCUMENTARY_GENRE_ID = 99; // TMDB genre ID for documentaries
const TOP_MOVIES_LIMIT = 16; // Limit on number of movies to display
const OMDB_DELAY = 500; // Delay between OMDB API calls (ms)
const MIN_YEAR = 2023 // Minimum release year
const MAX_YEAR = 2025; // Maximum release year

// Interface representing a basic movie from TMDB
interface TMDBMovie {
  id: number;
  title: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  overview: string;
}

// Extended movie interface with additional OMDB details
interface MovieDetails extends Movie {
  imdbRating: string;
  Year: string;
  Genre: string;
}

// Fetch a list of documentary movies from TMDB with filters applied
async function fetchDocumentaries(page: number): Promise<TMDBMovie[]> {
  try {
    const params = {
      api_key: import.meta.env.VITE_TMDB_API_KEY,
      with_genres: DOCUMENTARY_GENRE_ID,
      sort_by: 'popularity.desc',
      'vote_count.gte': 40,
      // 'vote_average.gte': 7.5,
      'primary_release_date.gte': `${MIN_YEAR}-01-01`,
      'primary_release_date.lte': `${MAX_YEAR}-12-31`,
      with_watch_providers: '',
      watch_region: 'US', // Region code
      with_watch_monetization_types: 'flatrate', // Subscription services
      include_adult: false,
      page,
      language: 'en-US',
      region: 'US'
    };

    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', { params });

    // Debug: TMDB Response
    // DEBUG && console.debug('✅ TMDB Response:', {
    //   page,
    //   results: response.data.results.length,
    //   movies: response.data.results.map((m: any) => ({
    //     title: m.title,
    //     year: m.release_date?.split('-')[0],
    //     overview: m.overview
    //   }))
    // });

    // Simplify the movie objects returned by TMDB
    return response.data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      release_date: movie.release_date,
      overview: movie.overview,
      watch_providers: movie['watch/providers']?.results?.US?.flatrate || []
    }));
  } catch (error) {
    console.error('TMDB API Error:', error);
    return [];
  }
}

// Validate a TMDB movie using OMDB data to ensure it's a documentary with a valid IMDb rating
async function validateMovie(tmdbMovie: TMDBMovie): Promise<MovieDetails | null> {
  try {
    const releaseYear = tmdbMovie.release_date?.split('-')[0] || '';

    // Debug: Log OMDB request details
    // DEBUG && console.debug('🔍 OMDB Request:', {
    //   title: tmdbMovie.title,
    //   year: releaseYear,
    //   params: {
    //     t: tmdbMovie.title,
    //     y: releaseYear,
    //     type: 'movie',
    //     apikey: '***' // Redacted for security
    //   }
    // });

    const response = await axios.get(`https://www.omdbapi.com/`, {
      params: {
        t: tmdbMovie.title,
        y: releaseYear,
        type: 'movie',
        apikey: import.meta.env.VITE_OMDB_API_KEY
      }
    });

    // Debug: Log full OMDB response
    // DEBUG && console.debug('📥 OMDB Response:', {
    //   title: tmdbMovie.title,
    //   status: response.data.Response,
    //   data: response.data,
    //   matchDetails: {
    //     titleMatch: response.data.Title === tmdbMovie.title,
    //     yearMatch: response.data.Year === releaseYear,
    //     typeMatch: response.data.Type === 'movie'
    //   }
    // });

    if (response.data.Response !== 'True') return null;

    const movieYear = parseInt(response.data.Year || releaseYear);
    if (movieYear < MIN_YEAR || movieYear > MAX_YEAR) return null;

    // Check if the movie is a documentary by inspecting genre and descriptions
    const isDocumentary = [
      response.data.Genre?.toLowerCase(),
      response.data.Plot?.toLowerCase(),
      tmdbMovie.overview?.toLowerCase()
    ].some(text => text?.includes('documentary'));

    const hasRating = response.data.imdbRating !== 'N/A';
    if (!isDocumentary || !hasRating) return null;

    const providersResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/watch/providers`,
      { params: { api_key: import.meta.env.VITE_TMDB_API_KEY } }
    );

    // Get streaming providers from TMDB
    const watchProviders = providersResponse.data.results?.US?.flatrate || [];


    // Return enriched movie details
    return {
      ...response.data,
      imdbRating: response.data.imdbRating,
      Year: response.data.Year,
      Genre: response.data.Genre,
      Poster: response.data.Poster !== 'N/A' ? response.data.Poster : '/placeholder.jpg',
      tmdbId: tmdbMovie.id,
      WatchProviders: watchProviders.map((p: any) => ({
        id: p.provider_id,
        name: p.provider_name,
        logo_path: p.logo_path
      })),
    };
  } catch (error) {
    console.error(`Validation failed for ${tmdbMovie.title}:`, error);
    return null;
  }
}


// Load and validate movies from TMDB and OMDB
async function loadMovies() {
  try {
    let page = 1;
    const movies: TMDBMovie[] = [];
    const uniqueTitles = new Set<string>();

    // Fetch movies across multiple pages until enough valid ones are found or max pages hit
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

    const batchSize = 5; // Control batch size for OMDB requests
    const validated: MovieDetails[] = [];

    // Validate movies in batches to avoid OMDB rate limits
    for (let i = 0; i < movies.length; i += batchSize) {
      const batch = movies.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(validateMovie));
      validated.push(...results.filter(Boolean) as MovieDetails[]);
      await new Promise(resolve => setTimeout(resolve, OMDB_DELAY));
    }

    // If validation fails completely, fall back to predefined movies
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

    // Return top-rated documentaries
    return validated
      .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
      .slice(0, TOP_MOVIES_LIMIT);
  } catch (error) {
    console.error('Movie loading failed:', error);
    return [];
  }
}

// Root App component
function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Theme toggle state
  const [movies, setMovies] = useState<Movie[]>([]); // Loaded movie list
  const [searchTerm, setSearchTerm] = useState(''); // Current search input
  const [loading, setLoading] = useState(false); // Loading indicator
  const [error, setError] = useState(''); // Error message

  // Load saved theme preference from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('docupicksTheme');
    if (savedTheme) setIsDarkTheme(savedTheme === 'dark');
  }, []);

  // Persist theme preference to local storage
  useEffect(() => {
    localStorage.setItem('docupicksTheme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  // Load movies on initial app load
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

  // Handle user-initiated search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(searchTerm)}&apikey=${import.meta.env.VITE_OMDB_API_KEY}`);

      // Ensure the movie is a documentary
      if (response.data.Response !== 'True' || !response.data.Genre.toLowerCase().includes('documentary')) {
        throw new Error(response.data.Error || 'Not a documentary');
      }

      // Add new result if not already shown
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

  // Main app rendering
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
          {/* Show loading spinner */}
          {loading && <CircularProgress sx={{ display: 'block', margin: '4rem auto' }} />}
          {/* Display any errors */}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Grid layout for displaying movies */}
          <Grid
            container
            spacing={3}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',  // 1 column on mobile
                sm: 'repeat(2, minmax(0, 1fr))',   // 2 columns on small screens
                md: 'repeat(3, minmax(0, 1fr))',   // 3 columns on medium
                lg: 'repeat(4, minmax(0, 1fr))'    // 4 columns on large
              },
              gap: 3,
              padding: '0 24px !important'
            }}
          >
            {movies.map(movie => (
              <Grid key={movie.imdbID}>  {/* No item prop or size props */}
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