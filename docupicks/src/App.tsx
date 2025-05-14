// React and MUI imports
import { useEffect, useState } from 'react';
import { CircularProgress, Box, Alert, Grid, Container, CssBaseline, Chip, Typography } from '@mui/material';
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
import { KEYWORDS } from './keywords';

// Configuration constants
const DEBUG = true; // Enable debug logs
const MAX_RETRY_PAGES = 1; // Max number of TMDB pages to query
const DOCUMENTARY_GENRE_ID = 99; // TMDB genre ID for documentaries
const TOP_MOVIES_LIMIT = 40; // Limit on number of movies to display
const OMDB_DELAY = 500; // Delay between OMDB API calls (ms)
const MIN_YEAR = 2000 // Minimum release year
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

// Helper function to get TMDB keyword IDs
async function getKeywordId(keyword: string): Promise<number | null> {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/search/keyword', {
      params: {
        api_key: import.meta.env.VITE_TMDB_API_KEY,
        query: keyword,
      },
    });

    // // Debug: Log keyword search results
    // DEBUG && console.debug('🔎 Keyword Search:', {
    //   keyword,
    //   results: response.data.results.length,
    //   firstResult: response.data.results[0]
    // });

    return response.data.results[0]?.id || null;
  } catch (error) {
    console.error(`Error fetching keyword ID for ${keyword}:`, error);
    return null;
  }
}

// Fetch a list of documentary movies from TMDB with filters applied
async function fetchDocumentaries(page: number, keywordIds?: string): Promise<TMDBMovie[]> {
  try {
    const params: any = {
      api_key: import.meta.env.VITE_TMDB_API_KEY,
      with_genres: DOCUMENTARY_GENRE_ID,
      sort_by: 'rating.desc',
      'vote_count.gte': 10,
      'vote_average.gte': 6.0,
      'primary_release_date.gte': `${MIN_YEAR - 2}-01-01`,
      'primary_release_date.lte': `${MAX_YEAR}-12-31`,
      with_watch_providers: '',
      watch_region: 'US', // Region code
      with_watch_monetization_types: 'flatrate|ads ', // Subscription services
      include_adult: false,
      page,
      language: 'en-US',
      region: 'US'
    };

    // Add keyword filter if provided
    if (keywordIds) {
      params.with_keywords = keywordIds;
    }

    // // Debug: Show final query parameters
    // DEBUG && console.debug('🔍 TMDB Query:', {
    //   with_keywords: params.with_keywords?.split('|') || [],
    //   page,
    //   genre: DOCUMENTARY_GENRE_ID
    // });


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

    // // Debug: Log OMDB request details
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

    // // Debug: Log full OMDB response
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

    const yearVariance = 1;
    if (movieYear < (MIN_YEAR - yearVariance) || movieYear > (MAX_YEAR + yearVariance)) return null;

    // Check if the movie is a documentary by inspecting genre and descriptions
    const isDocumentary = [
      response.data.Genre?.toLowerCase(),
      response.data.Plot?.toLowerCase(),
      tmdbMovie.overview?.toLowerCase()
    ].some(text =>
      text?.includes('documentary') ||
      text?.includes('docu') ||
      text?.includes('non-fiction') ||
      text?.includes('true story') ||
      text?.includes('biography') ||
      text?.includes('investigative')
    );

    // if (!isDocumentary) {
    //   DEBUG && console.warn('❌ Documentary Check Failed:', {
    //     title: tmdbMovie.title,
    //     genre: response.data.Genre,
    //     plot: response.data.Plot?.substring(0, 100) + '...',
    //     overview: tmdbMovie.overview?.substring(0, 100) + '...'
    //   });
    // }

    if (response.data.imdbRating === 'N/A') {
      DEBUG && console.warn('❌ Missing Rating:', tmdbMovie.title);
      return null;
    }

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

    // Get keyword IDs using imported KEYWORDS
    const keywordIds = await Promise.all(KEYWORDS.map(getKeywordId));
    const validKeywordIds = keywordIds.filter(id => id !== null).join('|');

    // // Debug: Enhanced debugging for TMDB queries
    // DEBUG && console.debug('🔧 TMDB Query Parameters:', {
    //   genre: DOCUMENTARY_GENRE_ID,
    //   keywords: validKeywordIds,
    //   minYear: MIN_YEAR,
    //   maxYear: MAX_YEAR,
    //   pagesToQuery: MAX_RETRY_PAGES
    // });

    // Fetch movies across multiple pages until enough valid ones are found or max pages hit
    while (movies.length < TOP_MOVIES_LIMIT && page <= MAX_RETRY_PAGES) {
      const pageResults = await fetchDocumentaries(page, validKeywordIds);

      // Debug: Log raw TMDB results with actual page number
      DEBUG && console.debug(`📦 Raw TMDB Results (Page ${page}):`, {
        count: pageResults.length,
        titles: pageResults.map(m => m.title),
        apiUrl: `https://api.themoviedb.org/3/discover/movie?${new URLSearchParams({
          with_genres: DOCUMENTARY_GENRE_ID.toString(),
          with_keywords: validKeywordIds,
          page: page.toString(),
        })}`
      });

      // Process keyword results first
      const newKeywordMovies = pageResults.filter(movie => {
        const movieYear = parseInt(movie.release_date?.split('-')[0] || '0');
        return !uniqueTitles.has(movie.title) && movieYear >= MIN_YEAR && movieYear <= MAX_YEAR;
      });

      // If no keyword results, try fallback
      if (newKeywordMovies.length === 0) {
        DEBUG && console.warn('⚠️ No keyword results - trying broader search');
        const fallbackResults = await fetchDocumentaries(page);
        newKeywordMovies.push(...fallbackResults.filter(movie =>
          !uniqueTitles.has(movie.title) &&
          parseInt(movie.release_date?.split('-')[0] || '0') >= MIN_YEAR
        ));
      }

      newKeywordMovies.forEach(movie => uniqueTitles.add(movie.title));
      movies.push(...newKeywordMovies);
      page++;
    }

    // Debug: Final movie candidates before validation
    DEBUG && console.debug('🎬 Movies for Validation:', {
      count: movies.length,
      titles: movies.map(m => m.title)
    });

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
    if (validated.length < TOP_MOVIES_LIMIT) {
      DEBUG && console.warn(`⚠️ Partial validation (${validated.length}/${TOP_MOVIES_LIMIT}) - supplementing`);

      const needed = TOP_MOVIES_LIMIT - validated.length;
      const fallbackResults = await Promise.all(
        FALLBACK_MOVIES.slice(0, needed).map(title =>
          axios.get(`https://www.omdbapi.com/?t=${title}&apikey=${import.meta.env.VITE_OMDB_API_KEY}`)
        )
      );

      const validFallbacks = fallbackResults
        .map(res => res.data)
        .filter(movie => movie.Response === 'True');

      // START OF MODIFIED FALLBACK HANDLING
      const processedFallbacks = await Promise.all(
        validFallbacks.map(async (omdbMovie) => {
          try {
            // Get TMDB ID using IMDb ID from OMDB
            const tmdbFindResponse = await axios.get(
              `https://api.themoviedb.org/3/find/${omdbMovie.imdbID}`,
              {
                params: {
                  api_key: import.meta.env.VITE_TMDB_API_KEY,
                  external_source: 'imdb_id',
                },
              }
            );

            const tmdbMovie = tmdbFindResponse.data.movie_results[0];
            if (!tmdbMovie) {
              DEBUG && console.warn(`No TMDB movie found for IMDb ID ${omdbMovie.imdbID}`);
              return null;
            }

            // Get watch providers from TMDB
            const providersResponse = await axios.get(
              `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/watch/providers`,
              { params: { api_key: import.meta.env.VITE_TMDB_API_KEY } }
            );

            const watchProviders = providersResponse.data.results?.US?.flatrate || [];

            // Create complete movie object
            return {
              ...omdbMovie,
              imdbRating: omdbMovie.imdbRating,
              Year: omdbMovie.Year,
              Genre: omdbMovie.Genre,
              Poster: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : '/placeholder.jpg',
              tmdbId: tmdbMovie.id,
              WatchProviders: watchProviders.map((p: any) => ({
                id: p.provider_id,
                name: p.provider_name,
                logo_path: p.logo_path,
              })),
            } as MovieDetails;
          } catch (error) {
            console.error(`Error processing fallback movie ${omdbMovie.Title}:`, error);
            return null;
          }
        })
      );

      const validProcessedFallbacks = processedFallbacks.filter(Boolean) as MovieDetails[];
      // END OF MODIFIED FALLBACK HANDLING

      return [...validated, ...validProcessedFallbacks]
        .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
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

  // Main app rendering
  return (
    <ThemeProvider theme={isDarkTheme ? imdbDarkTheme : imdbLightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header
          toggleTheme={() => setIsDarkTheme(!isDarkTheme)}
          isDarkTheme={isDarkTheme}
        />



        <Container component="main" maxWidth="xl" sx={{ py: 4, flex: 1, px: { xs: 2, sm: 3 } }}>
          {/* Show loading spinner */}
          {loading && <CircularProgress sx={{ display: 'block', margin: '4rem auto' }} />}
          {/* Display any errors */}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box sx={{
            mb: 4,
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
            px: { xs: 0, sm: 2 }
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Topics:
            </Typography>
            {KEYWORDS.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                size="medium"
                sx={{
                  borderRadius: '6px',
                  textTransform: 'capitalize',
                  fontWeight: 500,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText'
                }}
              />
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
            {movies.map(movie => (
              <Box key={`${movie.imdbID}-${movie.tmdbId}`}>
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