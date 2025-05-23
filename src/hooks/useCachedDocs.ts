import { useEffect, useState } from 'react';
import { get } from 'aws-amplify/api';
import type { Movie } from '../types';
import { FALLBACK_MOVIES } from '../fallbackMovies';
import axios from 'axios';

// How long to cache data in localStorage (12 hours)
const CACHE_DURATION = 12 * 60 * 60 * 1000;
const CACHE_KEY = 'docupicks-cache';
const CACHE_TIME_KEY = `${CACHE_KEY}-time`;

// OMDB and TMDB API keys from environment variable
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

/**
 * Fetch full movie details from OMDB by title
 * @param title string
 * @returns Movie or null
 */
async function fetchMovieDetails(title: string): Promise<Movie | null> {
    try {
        const response = await axios.get('https://www.omdbapi.com/', {
            params: {
                t: title,
                apikey: OMDB_API_KEY
            }
        });
        if (response.data && response.data.Response === 'True') {
            return response.data as Movie;
        } else {
            console.warn(`OMDB: No data found for title: ${title}`);
            return null;
        }
    } catch (error) {
        console.error(`OMDB fetch error for title: ${title}`, error);
        return null;
    }
}

/**
 * Fetch TMDb movie ID by title and year
 * @param title string
 * @param year string (optional)
 * @returns tmdbId or null
 */
async function fetchTmdbId(title: string, year?: string): Promise<number | null> {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
            params: {
                api_key: TMDB_API_KEY,
                query: title,
                year: year
            }
        });
        if (response.data && response.data.results && response.data.results.length > 0) {
            return response.data.results[0].id;
        }
        return null;
    } catch (error) {
        console.error(`TMDb fetch error for title: ${title}`, error);
        return null;
    }
}

/**
 * Fetch streaming providers for a TMDb movie ID
 * @param tmdbId number
 * @returns Array of providers or []
 */
async function fetchWatchProviders(tmdbId: number): Promise<any[]> {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers`, {
            params: {
                api_key: TMDB_API_KEY
            }
        });
        // US region, flatrate streaming providers
        return response.data.results?.US?.flatrate?.map((p: any) => ({
            id: p.provider_id,
            name: p.provider_name,
            logo_path: p.logo_path
        })) || [];
    } catch (error) {
        console.error(`TMDb watch providers fetch error for tmdbId: ${tmdbId}`, error);
        return [];
    }
}

/**
 * Enrich a fallback movie with OMDb and TMDb streaming data
 * @param title string
 * @returns Movie object with streaming info if possible
 */
async function enrichFallbackMovie(title: string): Promise<Movie> {
    // Step 1: Fetch OMDb details
    const omdbData = await fetchMovieDetails(title);
    // If OMDb data not found, return minimal fallback
    if (!omdbData) {
        return {
            Title: title,
            Year: '',
            Rated: '',
            Released: '',
            Runtime: '',
            Genre: '',
            Director: '',
            Writer: '',
            Actors: '',
            Plot: '',
            Language: '',
            Country: '',
            Awards: '',
            Poster: '',
            tmdbId: undefined,
            wikipediaUrl: undefined,
            budget: undefined,
            Ratings: [],
            WatchProviders: [],
            Metascore: '',
            imdbRating: '',
            imdbVotes: '',
            imdbID: '',
            Type: '',
            DVD: '',
            BoxOffice: '',
            Production: '',
            Website: '',
            Response: '',
        };
    }

    // Step 2: Try to find TMDb ID using OMDb title and year
    const tmdbId = await fetchTmdbId(omdbData.Title, omdbData.Year);

    // Step 3: Fetch streaming providers from TMDb if tmdbId found
    let watchProviders: any[] = [];
    if (tmdbId) {
        watchProviders = await fetchWatchProviders(tmdbId);
    }

    // Step 4: Return enriched movie object
    return {
        ...omdbData,
        tmdbId,
        WatchProviders: watchProviders
    };
}

/**
 * Custom React hook to load and cache documentary data.
 * - Tries to load from localStorage cache first.
 * - Falls back to AWS Amplify API if cache is expired or missing.
 * - If both fail, uses a static fallback list and enriches it by fetching full movie details.
 * - Always fills up to 40 movies, combining API and fallback as needed, sorted by IMDb rating.
 */
export function useCachedDocs() {
    const [data, setData] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Helper function to sort movies by IMDb rating
    const sortMoviesByRating = (movies: Movie[]): Movie[] => {
        return [...movies].sort((a, b) => {
            // Handle missing ratings and non-numeric values
            const ratingA = parseFloat(a.imdbRating) || 0;
            const ratingB = parseFloat(b.imdbRating) || 0;
            return ratingB - ratingA; // Descending order (highest first)
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Try to read from localStorage cache
                const cachedData = localStorage.getItem(CACHE_KEY);
                const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
                const cacheAge = cacheTime ? Date.now() - parseInt(cacheTime) : null;

                // console.debug('[Cache Check]', {
                //     hasCache: !!cachedData,
                //     cacheAge: cacheAge ? `${Math.round(cacheAge / 1000)}s ago` : 'N/A',
                //     isValid: cacheAge ? cacheAge < CACHE_DURATION : false
                // });

                if (cachedData && cacheTime && cacheAge < CACHE_DURATION) {
                    // console.debug('[Cache Load] Using cached data');
                    const parsedData = JSON.parse(cachedData);
                    // console.debug(`[Cache Load] Parsed ${parsedData.length} items`);
                    setData(sortMoviesByRating(parsedData).slice(0, 40));
                    setLoading(false);
                    return;
                }

                // 2. Try to fetch from AWS Amplify API
                console.debug('[API Fetch] Initiating API request to /cache');
                const restOperation = get({ 
                  apiName: 'docupicksApi',
                  path: '/cache',
                  options: {
                    headers: { 'Content-Type': 'application/json' }
                  }
                });
                
                // Get the response
                const { body } = await restOperation.response;
                
                // Parse the JSON body
                let freshData: Movie[] = await body.json();
                
                console.debug('[API Response] Received data:', {
                  count: freshData.length,
                  sample: freshData.slice(0, 3)
                });

                // Validate response structure
                if (!Array.isArray(freshData)) {
                    console.error('[Validation] Invalid API response structure:', freshData);
                    throw new Error('Invalid API response format');
                }

                // 3. If less than 40 movies, fill in with fallback movies (enriched with OMDb and TMDb streaming info)
                if (freshData.length < 40) {
                    // Get titles already present (case-insensitive)
                    const existingTitles = new Set(
                        freshData.map(m => m.Title?.toLowerCase().trim())
                    );
                    // Get fallback titles not already present
                    const needed = 40 - freshData.length;
                    const fallbackToFetch = FALLBACK_MOVIES
                        .filter(title => !existingTitles.has(title.toLowerCase().trim()))
                        .slice(0, needed);

                    // Fetch and enrich fallback movies in parallel
                    const fallbackDetails = await Promise.all(
                        fallbackToFetch.map(enrichFallbackMovie)
                    );
                    // Filter out nulls (shouldn't be any, but just in case)
                    const validFallbacks = fallbackDetails.filter(Boolean) as Movie[];

                    // Combine and sort
                    freshData = sortMoviesByRating([...freshData, ...validFallbacks]);
                } else {
                    freshData = sortMoviesByRating(freshData);
                }

                // 4. Save to cache and state
                localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
                localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                setData(freshData.slice(0, 40));
                console.debug('[API Success] Data updated from fresh API response');
            } catch (err) {
                // If API fails, log and fall back to cache or static data
                console.error('[Fetch Error] Main fetch flow failed:', err);
                handleError(err);
                await attemptFallbackRecovery();
            } finally {
                // console.debug('[Loading State] Setting loading to false');
                setLoading(false);
            }
        };

        /**
         * Attempts to recover from failure by using cached or fallback static data.
         * If using fallback, enrich with OMDB and TMDb streaming info.
         */
        const attemptFallbackRecovery = async () => {
            console.debug('[Fallback] Attempting recovery');
            try {
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    try {
                        const parsedData = JSON.parse(cachedData);
                        console.debug(`[Fallback] Using expired cache with ${parsedData.length} items`);
                        setData(sortMoviesByRating(parsedData).slice(0, 40));
                    } catch (parseError) {
                        console.error('[Fallback] Cache parse failed:', parseError);
                        throw new Error('Corrupted cache data');
                    }
                } else {
                    // If no cache, use static fallback movies (titles only)
                    // Enrich fallback movies by fetching full details from OMDB and TMDb
                    console.warn('[Fallback] No cache available, using static fallback with enrichment');
                    const enrichedFallbacks: Movie[] = [];

                    // Fetch all movie details in parallel
                    const fetchPromises = FALLBACK_MOVIES.map(enrichFallbackMovie);

                    // Wait for all fetches to complete
                    const fallbackResults = await Promise.all(fetchPromises);

                    // Sort results by IMDb rating
                    const sortedFallbacks = sortMoviesByRating(fallbackResults);

                    console.debug(`[Fallback] Generated ${sortedFallbacks.length} enriched fallback items`);
                    setData(sortedFallbacks.slice(0, 40));
                }
            } catch (cacheErr) {
                console.error('[Fallback] Recovery failed:', cacheErr);
                setData([]);
            }
        };

        fetchData();
        // Only run once on mount
        // eslint-disable-next-line
    }, []);

    /**
     * Handles errors by logging and updating error state.
     */
    const handleError = (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        const stack = err instanceof Error ? err.stack : undefined;
        console.error('[Error Handler]', {
            message,
            stackTrace: stack
        });
        setError(message);
    };

    return {
        data: data.slice(0, 40), // Enforce max limit after final sort
        loading,
        error
    };
}