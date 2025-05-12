export interface Movie {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: {
        Source: string;
        Value: string;
    WatchProviders?: {
        id: number;
        name: string;
        logo_path: string;
    }[];
    Metascore: string;
    imdbRating: string;
    imdbVotes: string;
    imdbID: string;
    Type: string;
    DVD: string;
    BoxOffice: string;
    Production: string;
    Website: string;
    Response: string;
    Error?: string;
}

export interface HeaderProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    handleSearch: (e: React.FormEvent) => void;
    toggleTheme?: () => void;
    isDarkTheme?: boolean;
}