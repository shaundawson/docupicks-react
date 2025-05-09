import { Card, CardContent, CardMedia, Typography, Chip, Stack } from '@mui/material';
import type { Movie } from '../types';

export const MovieCard = ({ movie }: { movie: Movie }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
            component="img"
            height="300"
            image={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'}
            alt={movie.Title}
        />
        <CardContent>
            <Typography variant="h5" gutterBottom>
                {movie.Title} ({movie.Year})
            </Typography>
            <Stack direction="row" spacing={1} mb={2}>
                <Chip label={`IMDb: ${movie.imdbRating}`} color="primary" />
                <Chip label={movie.Rated} variant="outlined" />
                <Chip label={movie.Runtime} variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
                {movie.Plot}
            </Typography>
            <Typography variant="caption" display="block" mt={2}>
                Directed by: {movie.Director}
            </Typography>
        </CardContent>
    </Card>
);