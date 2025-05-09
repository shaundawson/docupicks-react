import { Box, Card, CardContent, CardMedia, Typography, Chip, Stack } from '@mui/material';
import type { Movie } from '../types';

export const MovieCard = ({ movie }: { movie: Movie }) => (
    <Card sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: 4
        }
    }}>
        <Box sx={{
            position: 'relative',
            aspectRatio: '2/3',
            backgroundColor: 'rgba(0, 0, 0, 0.08)'
        }}>
            <CardMedia
                component="img"
                image={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'}
                alt={movie.Title}
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
            />
            <Chip
                label={`IMDb ${movie.imdbRating}`}
                color="primary"
                size="small"
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    fontWeight: 'bold',
                    backdropFilter: 'blur(4px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    color: 'white'
                }}
            />
        </Box>

        <CardContent sx={{
            flexGrow: 1,
            '& .MuiTypography-h6': {
                fontSize: '1rem',
                lineHeight: 1.2
            }
        }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                {movie.Title}
            </Typography>

            <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={1}>
                <Chip
                    label={movie.Year}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 1 }}
                />
                <Chip
                    label={movie.Runtime}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 1 }}
                />
                <Chip
                    label={movie.Rated}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 1 }}
                />
            </Stack>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2,
                    fontSize: '0.875rem'
                }}
            >
                {movie.Plot}
            </Typography>

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', fontStyle: 'italic' }}
            >
                Directed by: {movie.Director}
            </Typography>
        </CardContent>
    </Card>
);