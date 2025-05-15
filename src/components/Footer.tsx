import { Box, Container, Typography, Link } from '@mui/material';

const Copyright = () => {
    return (
        <Typography variant="body2" color="text.secondary" mt={1}>
            {'Copyright © '}
            <Link color="inherit" href="/">
                DocuPicks
            </Link>{' '}
            {new Date().getFullYear()}
            {'. Built with ❤️ by movie enthusiasts.'}
        </Typography>
    );
};

export const Footer = () => (
    <Box
        component="footer"
        sx={{
            py: 3,
            mt: 'auto',
            backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                    ? theme.palette.grey[200]
                    : theme.palette.grey[800],
            borderTop: '1px solid',
            borderColor: 'divider',
        }}
    >
        <Container maxWidth="lg">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                <Typography variant="body1" color="text.primary">
                    Explore the world of documentaries
                </Typography>

                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Powered by{' '}
                        <Link href="https://www.themoviedb.org/" target="_blank" rel="noopener">
                            TMDB
                        </Link>{' '}
                        and{' '}
                        <Link href="https://www.omdbapi.com/" target="_blank" rel="noopener">
                            OMDB
                        </Link>
                    </Typography>
                </Box>

                <Copyright />
            </Box>
        </Container>
    </Box>
);