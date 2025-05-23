/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    CACHE_TABLE
Amplify Params - DO NOT EDIT */
const { DynamoDB } = require('aws-sdk');
const axios = require('axios');

const docClient = new DynamoDB.DocumentClient();
const CACHE_TABLE = process.env.CACHE_TABLE;
if (!CACHE_TABLE) throw new Error("CACHE_TABLE environment variable not defined");

// Configuration constants matching React app
const MAX_RETRY_PAGES = 1;
const DOCUMENTARY_GENRE_ID = 99;
const TOP_MOVIES_LIMIT = 40;
const OMDB_DELAY = 500;
const MIN_YEAR = 2000;
const MAX_YEAR = 2025;

// Environment variable validation at cold start
console.log('Initializing with environment variables:', {
    TMDB_API_KEY: process.env.TMDB_API_KEY ? '***' : 'MISSING',
    OMDB_API_KEY: process.env.OMDB_API_KEY ? '***' : 'MISSING',
    KEYWORDS: process.env.KEYWORDS || 'MISSING',
    CACHE_TABLE: CACHE_TABLE || 'MISSING'
});

async function getKeywordId(keyword) {
    try {
        console.log(`Fetching keyword ID for: ${keyword}`);
        const response = await axios.get('https://api.themoviedb.org/3/search/keyword', {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: keyword,
            },
        });
        const keywordId = response.data.results[0]?.id || null;
        console.log(`Keyword ID for ${keyword}: ${keywordId}`);
        return keywordId;
    } catch (error) {
        console.error(`Error fetching keyword ID for ${keyword}:`, error.response?.data || error.message);
        return null;
    }
}

async function fetchDocumentaries(page, keywordIds) {
    try {
        console.log(`Fetching documentaries page ${page} with keywords: ${keywordIds}`);
        const params = {
            api_key: process.env.TMDB_API_KEY,
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
        console.log(`Found ${response.data.results.length} movies on page ${page}`);
        return response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            release_date: movie.release_date,
            overview: movie.overview
        }));
    } catch (error) {
        console.error('TMDB API Error:', error.response?.data || error.message);
        return [];
    }
}

async function validateMovie(tmdbMovie) {
    try {
        console.log(`Validating movie: ${tmdbMovie.title}`);
        const releaseYear = tmdbMovie.release_date?.split('-')[0] || '';

        const omdbResponse = await axios.get(`https://www.omdbapi.com/`, {
            params: {
                t: tmdbMovie.title,
                y: releaseYear,
                type: 'movie',
                apikey: process.env.OMDB_API_KEY
            }
        });

        console.log(`OMDB response for ${tmdbMovie.title}:`, omdbResponse.data.Response);

        if (omdbResponse.data.Response !== 'True') {
            console.log(`Skipping ${tmdbMovie.title} - OMDB response false`);
            return null;
        }

        const movieYear = parseInt(omdbResponse.data.Year || releaseYear);
        if (movieYear < MIN_YEAR || movieYear > MAX_YEAR) {
            console.log(`Skipping ${tmdbMovie.title} - Year ${movieYear} out of range`);
            return null;
        }

        const isDocumentary = [
            omdbResponse.data.Genre?.toLowerCase(),
            omdbResponse.data.Plot?.toLowerCase(),
            tmdbMovie.overview?.toLowerCase()
        ].some(text => text?.includes('documentary') || text?.includes('docu'));

        if (!isDocumentary || omdbResponse.data.imdbRating === 'N/A') {
            console.log(`Skipping ${tmdbMovie.title} - Not documentary or missing rating`);
            return null;
        }

        const providersResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/watch/providers`,
            { params: { api_key: process.env.TMDB_API_KEY } }
        );

        console.log(`Successfully validated ${tmdbMovie.title}`);
        return {
            ...omdbResponse.data,
            imdbRating: omdbResponse.data.imdbRating,
            Year: omdbResponse.data.Year,
            Genre: omdbResponse.data.Genre,
            Poster: omdbResponse.data.Poster !== 'N/A' ? omdbResponse.data.Poster : '/placeholder.jpg',
            tmdbId: tmdbMovie.id,
            WatchProviders: providersResponse.data.results?.US?.flatrate?.map(p => ({
                id: p.provider_id,
                name: p.provider_name,
                logo_path: p.logo_path
            })) || []
        };
    } catch (error) {
        console.error(`Validation failed for ${tmdbMovie.title}:`, error.response?.data || error.message);
        return null;
    }
}

exports.handler = async () => {
    try {
        console.log('---------- STARTING LAMBDA EXECUTION ----------');

        // Environment check
        if (!process.env.TMDB_API_KEY || !process.env.OMDB_API_KEY || !process.env.KEYWORDS) {
            throw new Error("Missing required environment variables");
        }

        const cacheKey = `DOCS-${new Date().toISOString().split('T')[0]}`;
        console.log(`Using cache key: ${cacheKey}`);

        // Check cache first
        console.log('Checking cache...');
        const cached = await docClient.get({
            TableName: CACHE_TABLE,
            Key: { id: cacheKey }
        }).promise();

        if (cached.Item) {
            console.log('Cache hit - returning cached data');
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cached.Item.data),
            };
        }
        console.log('Cache miss - fetching fresh data');

        // Fetch fresh data
        let page = 1;
        const movies = [];
        const keywords = process.env.KEYWORDS.split(',');
        console.log(`Processing keywords: ${keywords.join(', ')}`);

        const keywordPromises = keywords.map(k => {
            console.log(`Fetching keyword ID for: ${k}`);
            return getKeywordId(k);
        });

        const keywordIds = (await Promise.all(keywordPromises))
            .filter(id => id !== null)
            .join('|');
        console.log(`Resolved keyword IDs: ${keywordIds}`);

        while (movies.length < TOP_MOVIES_LIMIT && page <= MAX_RETRY_PAGES) {
            console.log(`Fetching page ${page}`);
            const pageResults = await fetchDocumentaries(page, keywordIds);
            const filtered = pageResults.filter(movie => {
                const movieYear = parseInt(movie.release_date?.split('-')[0] || '0');
                return movieYear >= MIN_YEAR && movieYear <= MAX_YEAR;
            });
            movies.push(...filtered);
            console.log(`Page ${page} added ${filtered.length} movies (total: ${movies.length})`);
            page++;
        }

        // Validate movies
        console.log(`Starting validation of ${movies.length} movies`);
        const validated = [];
        for (let i = 0; i < movies.length; i += 5) {
            const batch = movies.slice(i, i + 5);
            console.log(`Validating batch ${i / 5 + 1} (movies ${i}-${i + 5})`);
            const results = await Promise.all(batch.map(validateMovie));
            const validResults = results.filter(Boolean);
            validated.push(...validResults);
            console.log(`Batch ${i / 5 + 1} validated: ${validResults.length} passed`);
            await new Promise(resolve => setTimeout(resolve, OMDB_DELAY));
        }

        console.log(`Validation complete: ${validated.length} valid movies`);
        const sortedMovies = validated
            .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
            .slice(0, TOP_MOVIES_LIMIT);
        console.log(`Sorted movies: ${sortedMovies.length} items`);

        // Cache results
        console.log('Writing to cache...');
        await docClient.put({
            TableName: CACHE_TABLE,
            Item: {
                id: cacheKey,
                data: sortedMovies,
                ttl: Math.floor(Date.now() / 1000) + 86400
            }
        }).promise();
        console.log('Cache update successful');

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
            },
            body: JSON.stringify(sortedMovies),
        };
    } catch (error) {
        console.error('LAMBDA ERROR:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            response: error.response?.data
        });
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                error: 'Failed to load movies',
                details: process.env.NODE_ENV === 'production' ? undefined : error.message
            }),
        };
    }
};