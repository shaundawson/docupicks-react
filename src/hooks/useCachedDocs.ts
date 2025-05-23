import { useEffect, useState } from 'react';
import { API } from '@aws-amplify/api';
import type { Movie } from '../types';
import { FALLBACK_MOVIES } from '../fallbackMovies';
import axios from 'axios';

// How long to cache data in localStorage (12 hours)
const CACHE_DURATION = 12 * 60 * 60 * 1000;
const CACHE_KEY = 'docupicks-cache';
const CACHE_TIME_KEY = `${CACHE_KEY}-time`;

// OMDB API key from environment variable
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

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
 * Custom React hook to load and cache documentary data.
 * - Tries to load from localStorage cache first.
 * - Falls back to AWS Amplify API if cache is expired or missing.
 * - If both fail, uses a static fallback list and enriches it by fetching full movie details.
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

                console.debug('[Cache Check]', {
                    hasCache: !!cachedData,
                    cacheAge: cacheAge ? `${Math.round(cacheAge / 1000)}s ago` : 'N/A',
                    isValid: cacheAge ? cacheAge < CACHE_DURATION : false
                });

                if (cachedData && cacheTime && cacheAge < CACHE_DURATION) {
                    console.debug('[Cache Load] Using cached data');
                    const parsedData = JSON.parse(cachedData);
                    console.debug(`[Cache Load] Parsed ${parsedData.length} items`);
                    setData(sortMoviesByRating(parsedData));
                    setLoading(false);
                    return;
                }

                // 2. Try to fetch from AWS Amplify API
                console.debug('[API Fetch] Initiating API request to /cache');
                const freshData: Movie[] = await API.get('docupicksApi', '/cache', {});
                console.debug('[API Response] Received data:', {
                    count: freshData.length,
                    sample: freshData.slice(0, 3)
                });

                // Validate response structure
                if (!Array.isArray(freshData)) {
                    console.error('[Validation] Invalid API response structure:', freshData);
                    throw new Error('Invalid API response format');
                }

                // Sort and save to cache
                const sortedData = sortMoviesByRating(freshData);
                console.debug(`[Cache Update] Storing ${sortedData.length} items`);
                localStorage.setItem(CACHE_KEY, JSON.stringify(sortedData));
                localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                setData(sortedData);
                console.debug('[API Success] Data updated from fresh API response');
            } catch (err) {
                // If API fails, log and fall back to cache or static data
                console.error('[Fetch Error] Main fetch flow failed:', err);
                handleError(err);
                await attemptFallbackRecovery();
            } finally {
                console.debug('[Loading State] Setting loading to false');
                setLoading(false);
            }
        };

        /**
         * Attempts to recover from failure by using cached or fallback static data.
         * If using fallback, enrich with OMDB data.
         */
        const attemptFallbackRecovery = async () => {
            console.debug('[Fallback] Attempting recovery');
            try {
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    try {
                        const parsedData = JSON.parse(cachedData);
                        console.debug(`[Fallback] Using expired cache with ${parsedData.length} items`);
                        setData(sortMoviesByRating(parsedData));
                    } catch (parseError) {
                        console.error('[Fallback] Cache parse failed:', parseError);
                        throw new Error('Corrupted cache data');
                    }
                } else {
                    // If no cache, use static fallback movies (titles only)
                    // Enrich fallback movies by fetching full details from OMDB
                    console.warn('[Fallback] No cache available, using static fallback with enrichment');
                    const enrichedFallbacks: Movie[] = [];

                    // Fetch all movie details in parallel
                    const fetchPromises = FALLBACK_MOVIES.map(title =>
                        fetchMovieDetails(title)
                            .then(movieDetails => movieDetails || {
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
                            })
                    );

                    // Wait for all fetches to complete
                    const fallbackResults = await Promise.all(fetchPromises);

                    // Sort results by IMDb rating
                    const sortedFallbacks = sortMoviesByRating(fallbackResults);

                    console.debug(`[Fallback] Generated ${sortedFallbacks.length} enriched fallback items`);
                    setData(sortedFallbacks);
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
