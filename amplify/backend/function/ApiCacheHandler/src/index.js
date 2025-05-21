/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    CACHE_TABLE
Amplify Params - DO NOT EDIT */

import { DynamoDB } from 'aws-sdk';
import axios from 'axios';

const docClient = new DynamoDB.DocumentClient();
const CACHE_TABLE = process.env.CACHE_TABLE!;

// Configuration constants matching React app
const DEBUG = true;
const MAX_RETRY_PAGES = 1;
const DOCUMENTARY_GENRE_ID = 99;
const TOP_MOVIES_LIMIT = 40;
const OMDB_DELAY = 500;
const MIN_YEAR = 2000;
const MAX_YEAR = 2025;

interface TMDBMovie {
    id: number;
    title: string;
    release_date: string;
    overview: string;
}

interface MovieDetails {
    imdbID: string;
    Title: string;
    Year: string;
    Genre: string;
    imdbRating: string;
    Poster: string;
    Plot: string;
    Runtime: string;
    Director: string;
    tmdbId: number;
    WatchProviders: Array<{
        id: number;
        name: string;
        logo_path: string;
    }>;
}

async function getKeywordId(keyword: string): Promise<number | null> {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/search/keyword', {
            params: {
                api_key: process.env.VITE_TMDB_API_KEY,
                query: keyword,
            },
        });
        return response.data.results[0]?.id || null;
    } catch (error) {
        console.error(`Error fetching keyword ID for ${keyword}:`, error);
        return null;
    }
}

async function fetchDocumentaries(page: number, keywordIds?: string): Promise<TMDBMovie[]> {
    try {
        const params: any = {
            api_key: process.env.VITE_TMDB_API_KEY,
            with_genres: DOCUMENTARY_GENRE_ID,
            sort_by: 'rating.desc',
            'vote_count.gte': 10,
            'vote_average.gte': 6.0,
            'primary_release_date.gte': `${MIN_YEAR - 2}-01-01`,
            'primary_release_date.lte': `${MAX_YEAR}-12-31`,
            watch_region: 'US',
            include_adult: false,
            page,
            language: 'en-US',
            region: 'US'
        };

        if (keywordIds) params.with_keywords = keywordIds;

        const response = await axios.get('https://api.themoviedb.org/3/discover/movie', { params });
        return response.data.results.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
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
        const omdbResponse = await axios.get(`https://www.omdbapi.com/`, {
            params: {
                t: tmdbMovie.title,
                y: releaseYear,
                type: 'movie',
                apikey: process.env.VITE_OMDB_API_KEY
            }
        });

        if (omdbResponse.data.Response !== 'True') return null;

        const movieYear = parseInt(omdbResponse.data.Year || releaseYear);
        if (movieYear < MIN_YEAR || movieYear > MAX_YEAR) return null;

        const isDocumentary = [
            omdbResponse.data.Genre?.toLowerCase(),
            omdbResponse.data.Plot?.toLowerCase(),
            tmdbMovie.overview?.toLowerCase()
        ].some(text => text?.includes('documentary') || text?.includes('docu'));

        if (!isDocumentary || omdbResponse.data.imdbRating === 'N/A') return null;

        const providersResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/watch/providers`,
            { params: { api_key: process.env.VITE_TMDB_API_KEY } }
        );

        return {
            ...omdbResponse.data,
            imdbRating: omdbResponse.data.imdbRating,
            Year: omdbResponse.data.Year,
            Genre: omdbResponse.data.Genre,
            Poster: omdbResponse.data.Poster !== 'N/A' ? omdbResponse.data.Poster : '/placeholder.jpg',
            tmdbId: tmdbMovie.id,
            WatchProviders: providersResponse.data.results?.US?.flatrate?.map((p: any) => ({
                id: p.provider_id,
                name: p.provider_name,
                logo_path: p.logo_path
            })) || []
        };
    } catch (error) {
        console.error(`Validation failed for ${tmdbMovie.title}:`, error);
        return null;
    }
}

export const handler = async () => {
    try {
        if (!process.env.TMDB_API_KEY || !process.env.OMDB_API_KEY || !process.env.KEYWORDS) {
            throw new Error("Missing required environment variables");
        }
        const cacheKey = `DOCS-${new Date().toISOString().split('T')[0]}`;

        // Check cache first
        const cached = await docClient.get({
            TableName: CACHE_TABLE,
            Key: { id: cacheKey }
        }).promise();

        if (cached.Item) {
            return {
                statusCode: 200,
                body: JSON.stringify(cached.Item.data),
            };
        }

        // Fetch fresh data
        let page = 1;
        const movies: TMDBMovie[] = [];
        const keywordIds = (await Promise.all(process.env.KEYWORDS.split(',').map(getKeywordId))).filter(id => id !== null).join('|');

        while (movies.length < TOP_MOVIES_LIMIT && page <= MAX_RETRY_PAGES) {
            const pageResults = await fetchDocumentaries(page, keywordIds);
            movies.push(...pageResults.filter(movie => {
                const movieYear = parseInt(movie.release_date?.split('-')[0] || '0');
                return movieYear >= MIN_YEAR && movieYear <= MAX_YEAR;
            }));
            page++;
        }

        // Validate movies
        const validated: MovieDetails[] = [];
        for (let i = 0; i < movies.length; i += 5) {
            const batch = movies.slice(i, i + 5);
            const results = await Promise.all(batch.map(validateMovie));
            validated.push(...results.filter(Boolean) as MovieDetails[]);
            await new Promise(resolve => setTimeout(resolve, OMDB_DELAY));
        }

        const sortedMovies = validated
            .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
            .slice(0, TOP_MOVIES_LIMIT);

        // Cache results
        await docClient.put({
            TableName: CACHE_TABLE,
            Item: {
                id: cacheKey,
                data: sortedMovies,
                ttl: Math.floor(Date.now() / 1000) + 86400 // 24h TTL
            }
        }).promise();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(sortedMovies),
        };
    } catch (error) {
        console.error('Lambda error:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: 'Failed to load movies' }),
        };
    }
};