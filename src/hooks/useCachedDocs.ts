import { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import { Movie } from '../types';
import { FALLBACK_MOVIES } from '../fallbackMovies';

const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
const CACHE_KEY = 'docupicks-cache';
const CACHE_TIME_KEY = `${CACHE_KEY}-time`;

export function useCachedDocs() {
    const [data, setData] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try to read from localStorage first
                const cachedData = localStorage.getItem(CACHE_KEY);
                const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

                if (cachedData && cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
                    setData(JSON.parse(cachedData));
                    setLoading(false);
                    return;
                }

                // Fetch from AWS Amplify API
                const freshData: Movie[] = await API.get('docupicksApi', '/cache', {});

                // Validate response structure
                if (!Array.isArray(freshData)) {
                    throw new Error('Invalid API response format');
                }

                // Update cache
                localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
                localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                setData(freshData);

            } catch (err) {
                handleError(err);
                attemptFallbackRecovery();
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleError = (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load documentaries';
        console.error('Caching Error:', message);
        setError(message);
    };

    const attemptFallbackRecovery = () => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                setData(JSON.parse(cachedData));
            } else {
                setData(FALLBACK_MOVIES);
                console.warn('Using fallback data');
            }
        } catch (cacheErr) {
            console.error('Cache recovery failed:', cacheErr);
            setData(FALLBACK_MOVIES);
        }
    };

    return {
        data: data.slice(0, 40), // Enforce max limit
        loading,
        error
    };
}