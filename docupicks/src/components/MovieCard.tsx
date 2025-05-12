import { useState } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Chip, Stack, Button, Modal, CardActions, IconButton, Link } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { Movie } from '../types';

// Import local IMDb logo files
import imdbLogo from '../assets/IMDB_Logo.png';
import imdbProLogo from '../assets/IMDbPro.png';


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
    const imdbFullCreditsUrl = `https://www.imdb.com/title/${movie.imdbID}/fullcredits/`;
    const imdbProUrl = `https://pro.imdb.com/title/${movie.imdbID}`;


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
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', fontStyle: 'italic' }}
                        >
                            Directed by: {movie.Director}
                        </Typography>
                    </CardContent>

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

            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={modalStyle}>
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            color: 'text.secondary'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

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

                    {/* Streaming providers section */}
                    {movie.WatchProviders && movie.WatchProviders.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Available On
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                                {movie.WatchProviders.map((provider) => (
                                    <Box key={provider.id} sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        p: 1,
                                        bgcolor: 'background.paper',
                                        borderRadius: 1,
                                        boxShadow: 1
                                    }}>
                                        <img
                                            src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                            alt={provider.name}
                                            style={{ height: 30 }}
                                        />
                                        <Typography variant="body2">{provider.name}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* IMDb Links Section */}
                    <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>IMDb Links</Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                            <Link
                                href={imdbFullCreditsUrl}
                                target="_blank"
                                rel="noopener"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    color: 'text.primary',
                                    '&:hover': {
                                        color: 'primary.main',
                                        textDecoration: 'none'
                                    }
                                }}
                            >
                                <OpenInNewIcon fontSize="small" />
                                <Typography>Full Credits on IMDb</Typography>
                            </Link>

                            <Link
                                href={imdbProUrl}
                                target="_blank"
                                rel="noopener"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    color: 'text.primary',
                                    '&:hover': {
                                        color: 'primary.main',
                                        textDecoration: 'none'
                                    }
                                }}
                            >
                                <OpenInNewIcon fontSize="small" />
                                <Typography>IMDb Pro Details</Typography>
                            </Link>
                        </Stack>
                    </Box>

                    {/* Close Button */}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            onClick={() => setOpen(false)}
                            startIcon={<CloseIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1,
                                fontWeight: 'bold'
                            }}
                        >
                            Close Details
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};