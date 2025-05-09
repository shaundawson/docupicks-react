import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Stack,
    Button,
    Modal,
    CardActions
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import type { Movie } from '../types';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 600,
    width: '90%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '90vh',
    overflowY: 'auto',
};

export const MovieCard = ({ movie }: { movie: Movie }) => {
    const [open, setOpen] = useState(false);
    const rottenTomatoes = movie.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || 'N/A';

    return (
        <>
            <Card sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                bgcolor: 'background.paper',
                '&:hover': {
                    boxShadow: '0 4px 8px rgba(245, 197, 24, 0.2)'
                }
            }}>
                {/* Poster Image with Gradient Overlay */}
                <Box sx={{
                    position: 'relative',
                    aspectRatio: '2/3',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
                    }
                }}>
                    <CardMedia
                        component="img"
                        image={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'}
                        alt={movie.Title}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />

                    {/* Rating Chips */}
                    <Stack direction="row" spacing={1} sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        right: 16,
                        zIndex: 1
                    }}>
                        <Chip
                            label={`IMDb ${movie.imdbRating}`}
                            color="primary"
                            sx={{ fontWeight: 700, fontSize: '0.9rem' }}
                        />
                    </Stack>
                </Box>

                {/* Content Area with Bottom Padding for Button */}
                <Box sx={{
                    flexGrow: 1,
                    position: 'relative',
                    pb: 8
                }}>
                    <CardContent sx={{
                        '& .MuiTypography-h6': {
                            fontSize: '1rem',
                            lineHeight: 1.2
                        }
                    }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {movie.Title}
                        </Typography>

                        {/* Metadata Chips */}
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

                        {/* Truncated Plot */}
                        {/* <Typography
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
                        </Typography> */}

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', fontStyle: 'italic' }}
                        >
                            Directed by: {movie.Director}
                        </Typography>
                    </CardContent>

                    {/* Fixed Position Button */}
                    <CardActions sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        justifyContent: 'center',
                        bgcolor: 'background.paper',
                        py: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<InfoIcon />}
                            onClick={() => setOpen(true)}
                            sx={{
                                borderRadius: 2,
                                width: '90%',
                                mx: 'auto'
                            }}
                        >
                            Full Details
                        </Button>
                    </CardActions>
                </Box>
            </Card>

            {/* Details Modal */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h4" gutterBottom>{movie.Title}</Typography>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <Chip label={movie.Year} color="primary" />
                        <Chip label={movie.Runtime} color="secondary" />
                        <Chip label={movie.Rated} variant="outlined" />
                    </Stack>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Plot Summary</Typography>
                        <Typography variant="body1" sx={{
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'break-word',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            pr: 2
                        }}>
                            {movie.Plot}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                        <Box>
                            <Typography variant="subtitle1" gutterBottom>Details</Typography>
                            <Typography variant="body2">Director: {movie.Director}</Typography>
                            <Typography variant="body2">Starring: {movie.Actors}</Typography>
                            <Typography variant="body2">Genre: {movie.Genre}</Typography>
                        </Box>

                        {movie.Awards !== 'N/A' && (
                            <Box>
                                <Typography variant="subtitle1" gutterBottom>Awards</Typography>
                                <Typography variant="body2">{movie.Awards}</Typography>
                            </Box>
                        )}
                    </Stack>

                    <Box>
                        <Typography variant="h6" gutterBottom>Ratings</Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                            {movie.Ratings?.map((rating, index) => (
                                <Chip
                                    key={index}
                                    label={`${rating.Source}: ${rating.Value}`}
                                    variant="outlined"
                                    sx={{ borderRadius: 1 }}
                                />
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};