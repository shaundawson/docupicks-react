import { useEffect, useState } from 'react';
// Import the modular Amplify API client
import { API } from '@aws-amplify/api';
import type { Movie } from '../types';
import { FALLBACK_MOVIES } from '../fallbackMovies';

// How long to cache data in localStorage (12 hours)
const CACHE_DURATION = 12 * 60 * 60 * 1000;
const CACHE_KEY = 'docupicks-cache';
const CACHE_TIME_KEY = `${CACHE_KEY}-time`;

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

                if (cachedData && cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
                    setData(JSON.parse(cachedData));
                    setLoading(false);
                    return;
                }

                // 2. Try to fetch from AWS Amplify API
                // NOTE: This will fail locally unless your Amplify backend is running and env vars are set
                const freshData: Movie[] = await API.get('docupicksApi', '/cache', {});

                // Validate response structure
                if (!Array.isArray(freshData)) {
                    throw new Error('Invalid API response format');
                }

                // Save to cache
                localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
                localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                setData(freshData);
            } catch (err) {
                // If API fails, log and fall back to cache or static data
                handleError(err);
                attemptFallbackRecovery();
            } finally {
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
        const message = err instanceof Error ? err.message : 'Failed to load documentaries';
        console.error('Caching Error:', message);
        setError(message);
    };

    /**
     * Attempts to recover from failure by using cached or fallback static data.
     */
    const attemptFallbackRecovery = () => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                setData(JSON.parse(cachedData));
            } else {
                // If no cache, use static fallback movies (titles only)
                // These may not have full Movie fields, so downstream code should handle gracefully
                setData(
                    FALLBACK_MOVIES.map(title => ({
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
                    }))
                );
                console.warn('Using fallback data');
            }
        } catch (cacheErr) {
            console.error('Cache recovery failed:', cacheErr);
            setData([]);
        }
    };

    return {
        data: data.slice(0, 40), // Enforce max limit
        loading,
        error
    };
}
