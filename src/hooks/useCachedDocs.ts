import { useEffect, useState } from 'react';
// Import the modular Amplify API client
import { API } from '@aws-amplify/api';
import type { Movie } from '../types';
import { FALLBACK_MOVIES } from '../fallbackMovies';

// How long to cache data in localStorage (12 hours)
const CACHE_DURATION = 12 * 60 * 60 * 1000;
const CACHE_KEY = 'docupicks-cache';
const CACHE_TIME_KEY = `${CACHE_KEY}-time`;

console.log('Cache Table Name:', process.env.REACT_APP_CACHE_TABLE);

/**
 * Custom React hook to load and cache documentary data.
 * - Tries to load from localStorage cache first.
 * - Falls back to AWS Amplify API if cache is expired or missing.
 * - If both fail, uses a static fallback list.
 */
export function useCachedDocs() {
    const [data, setData] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

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
                    setData(parsedData);
                    setLoading(false);
                    return;
                }

                // 2. Try to fetch from AWS Amplify API
                // NOTE: This will fail locally unless your Amplify backend is running and env vars are set
                console.debug('[API Fetch] Initiating API request to /cache');
                const freshData: Movie[] = await API.get('docupicksApi', '/cache', {});
                console.debug('[API Response] Received data:', {
                    count: freshData.length,
                    sample: freshData.slice(0, 3) // Log first 3 items for validation
                });

                // Validate response structure
                if (!Array.isArray(freshData)) {
                    console.error('[Validation] Invalid API response structure:', freshData);
                    throw new Error('Invalid API response format');
                }

                // Save to cache
                console.debug(`[Cache Update] Storing ${freshData.length} items`);
                localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
                localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                setData(freshData);
                console.debug('[API Success] Data updated from fresh API response');
            } catch (err) {
                // If API fails, log and fall back to cache or static data
                console.error('[Fetch Error] Main fetch flow failed:', err);
                handleError(err);
                attemptFallbackRecovery();
            } finally {
                console.debug('[Loading State] Setting loading to false');
                setLoading(false);
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

    /**
     * Attempts to recover from failure by using cached or fallback static data.
     */
    const attemptFallbackRecovery = () => {
        console.debug('[Fallback] Attempting recovery');
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                try {
                    const parsedData = JSON.parse(cachedData);
                    console.debug(`[Fallback] Using expired cache with ${parsedData.length} items`);
                    setData(parsedData);
                } catch (parseError) {
                    console.error('[Fallback] Cache parse failed:', parseError);
                    throw new Error('Corrupted cache data');
                }
            } else {
                // If no cache, use static fallback movies (titles only)
                // These may not have full Movie fields, so downstream code should handle gracefully
                console.warn('[Fallback] No cache available, using static fallback');
                const fallbackData = FALLBACK_MOVIES.map(title => ({
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
                    }));
                console.debug(`[Fallback] Generated ${fallbackData.length} fallback items`);
                setData(fallbackData);
            }
        } catch (cacheErr) {
            console.error('[Fallback] Recovery failed:', cacheErr);
            setData([]);
        }
    };

    return {
        data: data.slice(0, 40), // Enforce max limit
        loading,
        error
    };
}

