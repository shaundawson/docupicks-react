/**
 * FALLBACK_MOVIES
 * ---------------
 * This constant array contains a curated list of essential documentaries related to racial justice,
 * police reform, systemic racism, and African American history in the United States.
 *
 * Purpose:
 * - Used as a fallback source of documentary titles when external APIs (TMDB/OMDB) are unavailable or fail.
 * - Ensures the app can always display a meaningful selection of important films, even during outages.
 *
 * Usage:
 * - Import and reference FALLBACK_MOVIES in any component or service that needs a reliable set of documentary titles.
 * - The array is marked as 'const' to guarantee immutability and type safety.
 *
 * Maintainers:
 * - Please update this list thoughtfully, preserving its focus on the app's core themes.
 */

export const FALLBACK_MOVIES = [
    'I am not your negro',
    'I Got a Monster',
    'MLK / FBI',
    'Hold Your Fire',
    'Whose Streets',
    'The Farm: Angola, USA',
    'The House I Live In',
    'Serving Life',
    'Stamped from the Beginning',
    'The Uncomfortable Truth',
    'Strong Island',
    'LA 92',
    'Daughters',
    'The Black Panthers: Vanguard Of The Revolution',
    'The Black Power Mixtape 1967-1975',
    '500 Years Later',
    'Time: The Kalief Browder Story',
    'Survivors Guide to Prison',
    'Detroit Under S.T.R.E.S.S.',
    '16 Shots',
    'O.J.: Made in America',
    'Truth Has Fallen',
    'L.A. Burning: The Riots 25 Years Later',
    'For Our Children',
    'Cocaine Cowboys',
    'This Place Rules',
    'The Seven Five',
    'The Greatest Lie Ever Sold: George Floyd and the Rise of BLM',
    'Trial 4',
    'Do Not Resist',
    'Say Her Name: The Life and Death of Sandra Bland',
    'The Murder of Fred Hampton',
    'Killing Them Safely',
    'Peace Officer',
    'Riotsville, U.S.A.'
] as const;