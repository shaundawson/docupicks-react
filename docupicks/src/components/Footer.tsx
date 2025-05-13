import {
    Box,
    Typography,
    Stack,
    Link,
    IconButton,
    Button,
    Divider,
    TextField
} from '@mui/material';
import { GitHub, Twitter, MovieFilter, LiveTv } from '@mui/icons-material';

export const Footer = () => (
    <Box
        component="footer"
        sx={{
            py: 8,
            mt: 'auto',
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            background: `linear-gradient(
        to bottom right,
        rgba(25, 25, 25, 0.9),
        rgba(35, 35, 35, 0.95)
      )`,
            backdropFilter: 'blur(4px)'
        }}
    >
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
            {/* Main Content */}
            <Stack spacing={4} alignItems="center">
                {/* Logo & Social */}
                <Stack spacing={3} alignItems="center">
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        '& svg': {
                            fontSize: 40,
                            color: 'primary.secondary'
                        }
                    }}>
                        <MovieFilter />
                        <Typography variant="h4" sx={{
                            fontWeight: 800,
                            background: 'linear-gradient(45deg, #f5c518 30%, #ffeb3b 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            DOCUPICKS
                        </Typography>
                        <LiveTv />
                    </Box>

                    <Stack direction="row" spacing={2}>
                        {[GitHub, Twitter].map((Icon, index) => (
                            <IconButton
                                key={index}
                                sx={{
                                    border: '2px solid',
                                    borderColor: 'divider',
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        borderColor: 'primary.main',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Icon sx={{ color: 'text.primary' }} />
                            </IconButton>
                        ))}
                    </Stack>
                </Stack>

                {/* Legal Links */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 1, sm: 3 }}
                    divider={<Divider orientation="vertical" flexItem />}
                    sx={{ color: 'text.secondary' }}
                >
                    <Link href="#" underline="hover">Privacy Policy</Link>
                    <Link href="#" underline="hover">Terms of Service</Link>
                    <Link href="#" underline="hover">Content Guidelines</Link>
                    <Link href="#" underline="hover">FAQ</Link>
                </Stack>



                {/* Copyright */}
                <Stack spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                    <Typography variant="caption">
                        © {new Date().getFullYear()} DocuPicks. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Typography variant="caption">Powered by</Typography>
                        <Link
                            href="https://www.omdbapi.com/"
                            target="_blank"
                            variant="caption"
                            sx={{
                                color: 'primary.light',
                                '&:hover': { color: 'primary.main' }
                            }}
                        >
                            OMDB API
                        </Link>
                        <Typography variant="caption">&</Typography>
                        <Link
                            href="https://www.themoviedb.org/"
                            target="_blank"
                            variant="caption"
                            sx={{
                                color: 'primary.light',
                                '&:hover': { color: 'primary.main' }
                            }}
                        >
                            TMDB
                        </Link>
                    </Stack>
                </Stack>
            </Stack>

            {/* Back to Top */}
            <Button
                variant="outlined"
                sx={{
                    position: 'absolute',
                    right: 24,
                    transform: 'translateY(-50%)',
                    borderRadius: 20,
                    px: 3,
                    textTransform: 'none'
                }}
            >
                ↑ Back to Top
            </Button>
        </Box>
    </Box>
);