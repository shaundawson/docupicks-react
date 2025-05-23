import { Box, Container, Typography, Link, useTheme } from '@mui/material';

/**
 * Copyright component
 * -------------------
 * Displays the copyright notice with the current year and a link to the homepage.
 */
const Copyright = () => (
    <Typography variant="body2" color="text.secondary" mt={0.5}>
        {'Copyright © '}
        <Link color="inherit" href="/">
            DocuPicks
        </Link>{' '}
        {new Date().getFullYear()}
        {'. Built with ❤️ by movie enthusiasts.'}
    </Typography>
);

/**
 * Footer component
 * ----------------
 * Seamless, compact, and professional footer.
 */
export const Footer = () => {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                mt: 'auto',
                backgroundColor: theme.palette.background.paper, // Seamless with page
                borderTop: `4px solid ${theme.palette.primary.main}`, // Gold accent bar
                boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
                py: 2, // Less vertical padding
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 0.5, // Tighter spacing between lines
                    }}
                >
                    {/* Main footer message */}
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Explore the world of documentaries
                    </Typography>

                    {/* Attribution to data providers (no logos) */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Powered by{' '}
                        <Link href="https://www.themoviedb.org/" target="_blank" rel="noopener" underline="hover">
                            TMDB
                        </Link>{' '}
                        and{' '}
                        <Link href="https://www.omdbapi.com/" target="_blank" rel="noopener" underline="hover">
                            OMDB
                        </Link>
                    </Typography>

                    {/* Designer credit */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Designed by{' '}
                        <Link href="https://www.iamsdawson.com" target="_blank" rel="noopener" underline="hover" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                            Shaun Dawson
                        </Link>
                    </Typography>

                    {/* Copyright */}
                    <Copyright />
                </Box>
            </Container>
        </Box>
    );
};
