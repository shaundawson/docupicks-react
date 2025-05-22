import { Box, Container, Typography, Link } from '@mui/material';

/**
 * Copyright component
 * -------------------
 * Displays the copyright notice with the current year and a link to the homepage.
 * This is separated for clarity and reuse.
 */
const Copyright = () => {
    return (
        <Typography variant="body2" color="text.secondary" mt={1}>
            {/* Static copyright text */}
            {'Copyright © '}
            {/* Link to the home page */}
            <Link color="inherit" href="/">
                DocuPicks
            </Link>{' '}
            {/* Dynamically display the current year */}
            {new Date().getFullYear()}
            {'. Built with ❤️ by movie enthusiasts.'}
        </Typography>
    );
};

/**
 * Footer component
 * ----------------
 * This is the main footer displayed at the bottom of the app.
 * It uses Material-UI components for consistent styling.
 */
export const Footer = () => (
    <Box
        component="footer"
        sx={{
            py: 3, // Padding on the y-axis (top and bottom)
            mt: 'auto', // Pushes footer to the bottom when using flex layouts
            backgroundColor: (theme) =>
                // Use a different background color for light and dark modes
                theme.palette.mode === 'light'
                    ? theme.palette.grey[200]
                    : theme.palette.grey[800],
            borderTop: '1px solid', // Adds a top border to separate footer
            borderColor: 'divider', // Uses the theme's divider color
        }}
    >
        {/* Container keeps the content centered and at a max width */}
        <Container maxWidth="lg">
            <Box
                sx={{
                    display: 'flex', // Arrange children in a column
                    flexDirection: 'column',
                    alignItems: 'center', // Center horizontally
                    textAlign: 'center', // Center text
                }}
            >
                {/* Main footer message */}
                <Typography variant="body1" color="text.primary">
                    Explore the world of documentaries
                </Typography>

                {/* Attribution to data providers */}
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Powered by{' '}
                        {/* External link to TMDB */}
                        <Link href="https://www.themoviedb.org/" target="_blank" rel="noopener">
                            TMDB
                        </Link>{' '}
                        and{' '}
                        {/* External link to OMDB */}
                        <Link href="https://www.omdbapi.com/" target="_blank" rel="noopener">
                            OMDB
                        </Link>
                    </Typography>
                </Box>

                {/* Show the copyright */}
                <Copyright />
            </Box>
        </Container>
    </Box>
);
