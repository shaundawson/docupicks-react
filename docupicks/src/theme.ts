// Import the function needed to create a custom Material UI theme
import { createTheme } from '@mui/material/styles';

// Define a custom dark theme for the app
const imdbDarkTheme = createTheme({
    palette: {
        // Use dark mode colors
        mode: 'dark',
        primary: {
            main: '#000000',           // Main color used for primary elements (black)
            contrastText: '#f5c518',   // Text color that contrasts with primary background
        },
        secondary: {
            main: '#01b4e4',           // Color used for secondary elements (light blue)
        },
        background: {
            default: '#121212',        // Default background color
            paper: '#000000',          // Background for components like cards and modals
        },
        text: {
            primary: '#ffffff',        // Main text color (white)
            secondary: '#a3a3a3',      // Less important text color (gray)
        },
    },
    typography: {
        // Define font families and styles
        fontFamily: [
            'Amazon Ember',            // Primary font
            'Helvetica Neue',          // Fallback fonts
            'Arial',
            'sans-serif',
        ].join(','),
        h6: {
            fontWeight: 700,           // Bold heading style
            fontSize: '1.1rem',
        },
        body2: {
            lineHeight: 1.4,           // Line spacing for body text
        },
    },
    components: {
        // Customize styles for specific Material UI components
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '20px',     // Rounded buttons
                    padding: '8px 20px',
                    textTransform: 'none',    // Keep original text casing
                },
                textPrimary: {
                    color: '#f5c518', // Force white text for text buttons
                    '&:hover': {
                        backgroundColor: 'rgba(204, 174, 74, 0.1)', // Subtle hover effect
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '30px',  // Rounded input fields
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',      // Rounded cards
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-3px)',  // Slight lift on hover
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 700,          // Bold text inside chips
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    // Custom scrollbar styling for dark theme
                    scrollbarColor: "#f5c518 #1a1a1a",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "#1a1a1a",
                        width: 8,
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        backgroundColor: "#f5c518",
                        borderRadius: 4,
                    },
                },
            },
        },
    },
});

// Define a custom light theme for the app
const imdbLightTheme = createTheme({
    palette: {
        mode: 'light',                     // Use light mode colors
        primary: {
            main: '#000000',               // Main color for buttons and highlights
            contrastText: '#ffffff',       // White text on black background
        },
        secondary: {
            main: '#01b4e4',               // Light blue for accents
        },
        background: {
            default: '#ffffff',            // Page background (white)
            paper: '#f5f5f5',              // Background for paper components
        },
        text: {
            primary: '#000000',            // Black text
            secondary: '#404040',          // Dark gray for secondary text
        },
    },
    // Reuse the same typography settings from the dark theme
    typography: { ...imdbDarkTheme.typography },

    components: {
        // Reuse dark theme component styles but customize where needed
        ...imdbDarkTheme.components,
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '20px',
                    padding: '8px 20px',
                    textTransform: 'none',
                    '&.MuiButton-contained': {
                        backgroundColor: '#01b4e4',   // Light blue background
                        color: '#ffffff',             // White text
                        '&:hover': {
                            backgroundColor: '#0099c3', // Darker blue on hover
                        },
                    },
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    // Custom scrollbar styling for light theme
                    scrollbarColor: "#01b4e4 #f5f5f5",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "#f5f5f5",
                    },
                },
            },
        },
    },
});


export { imdbDarkTheme, imdbLightTheme };
